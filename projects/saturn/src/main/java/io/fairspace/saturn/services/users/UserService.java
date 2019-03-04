package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.milton.http.values.HrefList.asList;
import static java.util.stream.Collectors.joining;
import static org.apache.jena.graph.NodeFactory.createURI;

public class UserService {
    private static final String ANONYMOUS = "http://fairspace.io/iri/test-user";
    private final RDFConnection rdf;
    private final Map<String, String> idToIri = new ConcurrentHashMap<>();
    private final Map<String, UserInfo> idToUserInfo = new ConcurrentHashMap<>();

    public UserService(RDFConnection rdf) {
        this.rdf = rdf;

        loadUsers();
    }

    private void loadUsers() {
        rdf.querySelect(storedQuery("users_list"), row -> {
            var id = row.getLiteral("externalId").getString();
            var iri = row.getResource("iri").getURI();
            var userInfo = new UserInfo(
                    id,
                    row.getLiteral("userName").getString(),
                    row.getLiteral("fullName").getString(),
                    decodeAuthorities(row.getLiteral("authorities").getString()));
            idToIri.put(id, iri);
            idToUserInfo.put(id, userInfo);
        });
    }

    public String getUserIRI(UserInfo userInfo) {
        if (userInfo == null) {
            return ANONYMOUS;
        }

        var existingIri = idToIri.get(userInfo.getUserId());
        if (existingIri != null) {
            var savedUserInfo = idToUserInfo.get(userInfo.getUserId());
            if (!savedUserInfo.equals(userInfo)) {
                updateUser(existingIri, userInfo);
            }

            return existingIri;
        }

        return createUser(userInfo);
    }

    private String createUser(UserInfo userInfo) {
        return commit("Store a new user, id: " + userInfo.getUserId(), rdf, () -> {
            rdf.update(storedQuery("users_create",
                    userInfo.getUserId(), userInfo.getUserName(), userInfo.getFullName(), encodeAuthorities(userInfo.getAuthorities())));
            var processor = new QuerySolutionProcessor<>(row -> row.getResource("iri").getURI());
            rdf.querySelect(storedQuery("users_iri_by_id", userInfo.getUserId()), processor);
            var iri = processor.getSingle().get();
            idToIri.put(userInfo.getUserId(), iri);
            idToUserInfo.put(userInfo.getUserId(), userInfo);
            return iri;
        });
    }

    private void updateUser(String iri, UserInfo userInfo) {
        commit("Update a new user, id: " + userInfo.getUserId(), rdf, () -> {
                rdf.update(storedQuery("users_update", createURI(iri), userInfo.getUserId(), userInfo.getFullName(),
                        userInfo.getUserName(), encodeAuthorities(userInfo.getAuthorities())));
            idToUserInfo.put(userInfo.getUserId(), userInfo);
        });
    }

    private static String encodeAuthorities(Set<String> authorities) {
        return authorities.stream().sorted().collect(joining(","));
    }

    private static Set<String> decodeAuthorities(String s) {
        return new HashSet<>(asList(s.split(",")));
    }
}
