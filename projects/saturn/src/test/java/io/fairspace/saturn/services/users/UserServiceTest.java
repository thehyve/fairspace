package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.util.List;

import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UserServiceTest {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final int refreshInterval = 50;

    private HttpServer mockServer;

    private UserService userService;

    private Dataset ds = DatasetFactory.createTxnMem();

    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);

    private final KeycloakGroup keycloakGroup = new KeycloakGroup() {{
       setId("groupid");
       setName("workspace-users");
    }};

    private final KeycloakUser keycloakUser = new KeycloakUser() {{
        setId("123");
        setFirstName("John");
        setLastName("Smith");
        setEmail("john@example.com");
        setEnabled(true);
    }};
    private final KeycloakUser alteredKeycloakUser = new KeycloakUser() {{
        setId(keycloakUser.getId());
        setFirstName(keycloakUser.getFirstName());
        setLastName(keycloakUser.getLastName());
        setEmail("smith@example.com");
        setEnabled(true);
    }};

    private volatile List<KeycloakUser> keycloakUsers = List.of(keycloakUser);

    @Before
    public void before() throws IOException {
        mockServer = HttpServer.create(new InetSocketAddress(0), 0);
        mockServer.createContext("/groups/groupid/members", exchange -> {
            var response = mapper.writeValueAsBytes(keycloakUsers);
            exchange.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        mockServer.createContext("/groups", exchange -> {
            var response = mapper.writeValueAsBytes(List.of(keycloakGroup));
            exchange.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        mockServer.start();

        userService = new UserService("http://localhost:" + mockServer.getAddress().getPort() + "/groups", "workspace-users", "http://localhost:" + mockServer.getAddress().getPort() + "/groups/%s/members/", refreshInterval, new DAO(rdf, null));
    }

    @Test
    public void usersAreRetrieved() {
        var iri = userService.getUserIri(keycloakUser.getId());

        var user =  userService.getUser(iri);

        assertEquals(keycloakUser.getFullName(), user.getName());
        assertEquals(keycloakUser.getEmail(), user.getEmail());
    }


    @Test
    public void usersGetPersisted() throws InterruptedException {
        var iri = userService.getUserIri(keycloakUser.getId());

        userService.getUser(iri);

        Thread.sleep(2 * refreshInterval); // Saving might take some time

        assertTrue(ds.getDefaultModel().containsResource(createResource(iri.getURI())));
    }


    @Test
    public void userInformationIsRefreshedWhenOnAuthorizedIsCalled() throws InterruptedException {
        var iri = userService.getUserIri(keycloakUser.getId());

        userService.getUser(iri);

        Thread.sleep(2 * refreshInterval); // User information gets staled

        keycloakUsers = List.of(alteredKeycloakUser); // Modify users

        var user =  userService.getUser(iri);

        assertEquals(keycloakUser.getEmail(), user.getEmail()); // The returned user is not refreshed

        userService.onAuthorized(keycloakUser.getId()); // Triggers refreshing

        Thread.sleep(100); // Refreshing is taking place

        user =  userService.getUser(iri); // Must be refreshed now

        assertEquals(alteredKeycloakUser.getEmail(), user.getEmail());

        assertTrue(ds.getDefaultModel().contains(createResource(iri.getURI()), FS.email, alteredKeycloakUser.getEmail()));
    }
}