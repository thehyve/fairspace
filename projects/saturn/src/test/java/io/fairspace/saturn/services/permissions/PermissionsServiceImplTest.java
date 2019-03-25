package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.services.AccessDeniedException;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class PermissionsServiceImplTest {
    private static final Node RESOURCE = createURI("http://example.com/resource");
    private static final Node USER1 = createURI("http://example.com/user1");
    private static final Node USER2 = createURI("http://example.com/user2");
    private static final Node USER3 = createURI("http://example.com/user3");
    private static final Resource COLLECTION = createResource("http://fairspace.io/ontology#Collection");

    private Dataset ds;
    private PermissionsService service;

    @Before
    public void setUp() {
        ds = DatasetFactory.create();
        service = new PermissionsServiceImpl(new RDFConnectionLocal(ds), () -> USER1);
        service.createResource(RESOURCE);
    }

    @Test
    public void testCreateResource() {
        assertEquals(Access.Manage, service.getPermission(RESOURCE));
    }

    @Test
    public void testSetPermission() {
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setWriteRestricted(RESOURCE, true);
        service.setPermission(RESOURCE, USER2, Access.Write);
        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.None);
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER3, Access.Manage);
        assertEquals(Access.Manage, service.getPermissions(RESOURCE).get(USER3));
    }


    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesCannotHaveReadPermissions() {
        service.setPermission(RESOURCE, USER2, Access.Read);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesMustBeMarkedAsRestrictedBeforeGrantingWritePermissions() {
        service.setPermission(RESOURCE, USER2, Access.Write);
    }

    @Test
    public void testGetPermissions() {
        service.setWriteRestricted(RESOURCE, true);
        service.setPermission(RESOURCE, USER2, Access.Write);
        service.setPermission(RESOURCE, USER3, Access.Manage);
        assertEquals(new HashMap<>() {{
                         put(createURI("http://example.com/user1"), Access.Manage);
                         put(createURI("http://example.com/user2"), Access.Write);
                         put(createURI("http://example.com/user3"), Access.Manage);
                     }},
                service.getPermissions(RESOURCE));
    }

    @Test
    public void testSetWriteRestricted() {
        assertFalse(service.isWriteRestricted(RESOURCE));
        service.setWriteRestricted(RESOURCE, true);
        assertTrue(service.isWriteRestricted(RESOURCE));
        service.setWriteRestricted(RESOURCE, false);
        assertFalse(service.isWriteRestricted(RESOURCE));
    }

    @Test
    public void testGettingPermissionsForFiles() {
        var collection = createResource("http://example.com/collection");
        var file = createResource("http://example.com/file");
        var filePath = createProperty("http://fairspace.io/ontology#filePath");
        ds.getDefaultModel()
                .add(collection, RDF.type, createResource("http://fairspace.io/ontology#Collection"))
                .add(collection, filePath, createPlainLiteral("collectionPath"))
                .add(file, filePath, createPlainLiteral("collectionPath/filePath"));


        service.createResource(collection.asNode());

        assertEquals(Access.Manage, service.getPermission(createURI("http://example.com/file")));
    }

    @Test
    public void testDefaultPermissionForCollections() {
        var coll = createResource("http://example.com/collection");
        ds.getDefaultModel().add(coll, RDF.type, COLLECTION);
        assertEquals(Access.None, service.getPermission(coll.asNode()));
    }

    @Test
    public void testDefaultPermissionForRegularEntities() {
        var entity = createResource("http://example.com/entity");
        ds.getDefaultModel().add(entity, RDF.type, createResource("http://fairspace.io/ontology#Entity"));
        assertEquals(Access.Write, service.getPermission(entity.asNode()));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUserCannotModifyHisOwnPermission() { ;
        service.setPermission(RESOURCE, USER1, Access.Write);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesCannotBeMarkedAsReadOnly() {
        service.setPermission(RESOURCE, USER2, Access.Read);
    }

    @Test
    public void testCanGrantPermissionsOnCollections() {
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDF.type, COLLECTION);
        assertFalse(service.getPermissions(RESOURCE).containsKey(USER2));
        service.setPermission(RESOURCE, USER2, Access.Read);
        assertEquals(Access.Read, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.Write);
        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.None);
        assertFalse(service.getPermissions(RESOURCE).containsKey(USER2));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCollectionsCanNotBeMarkedAsRestricted() {
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDF.type, COLLECTION);
        service.setWriteRestricted(RESOURCE, true);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testWriteAccessToEntitiesCanNotBeGrantedBeforeMarkingThemRestricted() {
        service.setPermission(RESOURCE, USER2, Access.Write);
    }

    @Test
    public void testSettingPermissionToNoneIfNoPermissionIsPresent() {
        service.setPermission(RESOURCE, USER2, Access.None);
        assertFalse(service.getPermissions(RESOURCE).containsKey(USER2));
    }

    @Test
    public void testSettingWriteRestrictedToTrueTwiceShouldNotClearPermissions() {
        service.setWriteRestricted(RESOURCE, true);
        service.setPermission(RESOURCE, USER2, Access.Write);
        service.setWriteRestricted(RESOURCE, true);
        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
    }

    @Test(expected = AccessDeniedException.class)
    public void testSettingPermissionsWithoutManageAccess() {
        service.setPermission(createURI("http://example.com/not-my-resource"), USER1, Access.Write);
    }
}