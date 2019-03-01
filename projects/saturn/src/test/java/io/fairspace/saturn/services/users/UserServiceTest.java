package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import org.apache.jena.rdfconnection.RDFConnection;
import org.junit.Before;

import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class UserServiceTest {
    private RDFConnection rdf;
    private UserService service;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        rdf = connect(createTxnMem());
        service = new UserService(rdf);
    }

}