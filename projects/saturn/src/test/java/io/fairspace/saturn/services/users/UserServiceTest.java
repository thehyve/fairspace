package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import io.fairspace.saturn.rdf.dao.DAO;
import org.apache.jena.graph.Node;
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

import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class UserServiceTest {

    private static final ObjectMapper mapper = new ObjectMapper();

    private HttpServer mockServer;

    private UserService userService;

    private Dataset ds = DatasetFactory.createTxnMem();

    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);

    private final KeycloakUser keycloakUser = new KeycloakUser() {{
        setId("123");
        setFirstName("John");
        setLastName("Smith");
        setEmail("john@example.com");
        setEnabled(true);
    }};

    private Node userIri;

    @Before
    public void before() throws IOException {
        mockServer = HttpServer.create(new InetSocketAddress(0), 0);
        mockServer.createContext("/users/123", exchange -> {
            var response = mapper.writeValueAsBytes(keycloakUser);
            exchange.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        mockServer.start();

        userService = new UserService("http://localhost:" + mockServer.getAddress().getPort() + "/users/%s", new DAO(rdf, null));
        userIri = userService.getUserIri(keycloakUser.getId());
    }

    @Test
    public void usersAreRetrieved() {
        var user =  userService.getUser(userIri);

        assertEquals(keycloakUser.getFullName(), user.getName());
        assertEquals(keycloakUser.getEmail(), user.getEmail());
    }

    @Test
    public void usersGetPersisted() throws InterruptedException {
        userService.getUser(userIri);
        assertTrue(ds.getDefaultModel().containsResource(createResource(userIri.getURI())));
    }
}
