package io.fairspace.saturn.services.permissions;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;

public class PermissionsServiceImplTest {
    private static final Node RESOURCE = createURI("http://example.com/resource");
    private Node USER = createURI("http://example.com/user1");
    private Dataset ds;
    private PermissionsService service;

    @Before
    public void setUp() {
        ds = DatasetFactory.create();
        service = new PermissionsServiceImpl(new RDFConnectionLocal(ds), () -> USER);
        service.createResource(RESOURCE);
    }

    @Test
    public void testCreateResource() {
        assertTrue(ds.getNamedModel("http://fairspace.io/iri/permissions").contains(
                createResource("http://example.com/resource"),
                createProperty("http://fairspace.io/ontology#manage"),
                createResource(USER.getURI())));
    }

    @Test
    public void testSetPermission() {
        var user = createURI("http://example.com/user2");
        assertNull(service.getPermissions(RESOURCE).get(user));
        service.setPermission(RESOURCE, user, Access.Read);
        assertEquals(Access.Read, service.getPermissions(RESOURCE).get(user));
        service.setPermission(RESOURCE, user, Access.Write);
        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(user));
        service.setPermission(RESOURCE, user, Access.None);
        assertNull(service.getPermissions(RESOURCE).get(user));
    }

    @Test
    public void testGetPermissions() {
        service.setPermission(RESOURCE, createURI("http://example.com/user2"), Access.Write);
        service.setPermission(RESOURCE, createURI("http://example.com/user3"), Access.Read);
        assertEquals(new HashMap<>() {{
                         put(createURI("http://example.com/user1"), Access.Manage);
                         put(createURI("http://example.com/user2"), Access.Write);
                         put(createURI("http://example.com/user3"), Access.Read);
                     }},
                service.getPermissions(RESOURCE));
    }

    @Test
    public void testSetReadOnly() {
        assertFalse(service.isReadOnly(RESOURCE));
        service.setReadOnly(RESOURCE, true);
        assertTrue(service.isReadOnly(RESOURCE));
        service.setReadOnly(RESOURCE, false);
        assertFalse(service.isReadOnly(RESOURCE));
    }
}