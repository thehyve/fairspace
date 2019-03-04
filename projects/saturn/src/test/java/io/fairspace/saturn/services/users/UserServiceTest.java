package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import java.util.HashSet;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static io.milton.http.values.HrefList.asList;
import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.assertFalse;

public class UserServiceTest {
    private final UserInfo userInfo = new UserInfo("id1", "user1", "name1", new HashSet<>(asList("role1", "role2")));
    private Dataset ds;
    private RDFConnection rdf;
    private UserService service;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        ds = createTxnMem();
        rdf = connect(ds);
        service = new UserService(rdf);
    }

    @Test
    public void shouldCreateAnIRIForANewUserAndThenReuseIt() {
        var iri = service.getUserIRI(userInfo);
        assertTrue(iri.startsWith(getWorkspaceURI()));
        assertEquals(iri, service.getUserIRI(userInfo));

        assertTrue(ds.getDefaultModel().contains(createResource(iri), RDFS.label, createStringLiteral(userInfo.getFullName())));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#externalId"), createStringLiteral(userInfo.getUserId())));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#userName"), createStringLiteral(userInfo.getUserName())));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#authorities"), createStringLiteral("role1,role2")));
    }

    @Test
    public void shouldKeepUsersBetweenRestarts() {
        var iri = service.getUserIRI(userInfo);

        service = new UserService(rdf); // Emulates restart

        assertEquals(iri, service.getUserIRI(userInfo));
    }

    @Test
    public void shouldUpdateMetadataWhenNeeded() {
        var iri = service.getUserIRI(userInfo);
        assertTrue(ds.getDefaultModel().contains(createResource(iri), RDFS.label, createStringLiteral("name1")));

        var updatedUserInfo = new UserInfo("id1", "user2", "name2", new HashSet<>(asList("role1", "role2", "role3")));
        assertEquals(iri, service.getUserIRI(updatedUserInfo));

        assertFalse(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#userName"), createStringLiteral("user1")));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#userName"), createStringLiteral("user2")));

        assertFalse(ds.getDefaultModel().contains(createResource(iri), RDFS.label, createStringLiteral("name1")));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), RDFS.label, createStringLiteral("name2")));

        assertFalse(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#authorities"), createStringLiteral("role1,role2")));
        assertTrue(ds.getDefaultModel().contains(createResource(iri), createProperty("http://fairspace.io/ontology#authorities"), createStringLiteral("role1,role2,role3")));
    }

}