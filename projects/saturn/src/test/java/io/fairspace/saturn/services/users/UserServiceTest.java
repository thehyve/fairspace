package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import org.apache.jena.rdfconnection.RDFConnection;
import org.junit.Before;
import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;

public class UserServiceTest {
    private final UserInfo userInfo = new UserInfo("id1", "user1", "name1", null);
    private RDFConnection rdf;
    private UserService service;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        rdf = connect(createTxnMem());
        service = new UserService(rdf);
    }

    @Test
    public void shouldCreateAnIRIForANewUserAndThenReuseIt() {
        var iri = service.getUserIRI(userInfo);
        assertTrue(iri.startsWith(getWorkspaceURI()));
        assertEquals(iri, service.getUserIRI(userInfo));
    }

    @Test
    public void shouldKeepUsersBetweenRestarts() {
        var iri = service.getUserIRI(userInfo);

        service = new UserService(rdf); // Emulates restart

        assertEquals(iri, service.getUserIRI(userInfo));
    }

}