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
import java.util.concurrent.TimeUnit;

import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UserServiceTest {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final int refreshInterval = 1;

    private volatile List<KeycloakUser> keycloakUsers = List.of();

    private HttpServer mockServer;

    private UserService userService;

    private Dataset ds = DatasetFactory.createTxnMem();

    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);


    @Before
    public void before() throws IOException {
        mockServer = HttpServer.create(new InetSocketAddress(0), 0);
        mockServer.createContext("/users", exchange -> {
            var response = mapper.writeValueAsBytes(keycloakUsers);
            exchange.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        mockServer.start();

        userService = new UserService("http://localhost:" + mockServer.getAddress().getPort() + "/users", refreshInterval, new DAO(rdf, null), false);
    }

    @Test
    public void retrievesUsers() {
        var keycloakUser = new KeycloakUser();
        keycloakUser.setId("123");
        keycloakUser.setFirstName("John");
        keycloakUser.setLastName("Smith");
        keycloakUser.setEmail("john@example.com");

        keycloakUsers = List.of(keycloakUser);

        var iri = userService.getUserIri(keycloakUser.getId());

        var user =  userService.getUser(iri);

        assertEquals(keycloakUser.getFullName(), user.getName());
        assertEquals(keycloakUser.getEmail(), user.getEmail());
    }


    @Test
    public void usersGetPersisted() throws InterruptedException {
        var keycloakUser = new KeycloakUser();
        keycloakUser.setId("123");
        keycloakUser.setFirstName("John");
        keycloakUser.setLastName("Smith");
        keycloakUser.setEmail("john@example.com");

        keycloakUsers = List.of(keycloakUser);

        var iri = userService.getUserIri(keycloakUser.getId());

        userService.getUser(iri);

        Thread.sleep(TimeUnit.SECONDS.toMillis(2 * refreshInterval)); // Saving might take some time

        assertTrue(ds.getDefaultModel().containsResource(createResource(iri.getURI())));
    }

    @Test
    public void userInformationGetRefreshed() throws InterruptedException {
        var keycloakUser1 = new KeycloakUser();
        keycloakUser1.setId("123");
        keycloakUser1.setFirstName("John");
        keycloakUser1.setLastName("Smith");
        keycloakUser1.setEmail("john@example.com");

        keycloakUsers = List.of(keycloakUser1);

        var iri = userService.getUserIri(keycloakUser1.getId());

        userService.getUser(iri);

        var keycloakUser2 = new KeycloakUser();
        keycloakUser2.setId(keycloakUser1.getId());
        keycloakUser2.setFirstName(keycloakUser1.getFirstName());
        keycloakUser2.setLastName(keycloakUser1.getLastName());
        keycloakUser2.setEmail("smith@example.com");

        keycloakUsers = List.of(keycloakUser2);

        Thread.sleep(TimeUnit.SECONDS.toMillis(2 * refreshInterval)); // Refreshing might take some time

        var user =  userService.getUser(iri);

        assertEquals(keycloakUser2.getEmail(), user.getEmail());

        assertTrue(ds.getDefaultModel().contains(createResource(iri.getURI()), FS.email, keycloakUser2.getEmail()));
    }
}