package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.Instant;

import static io.fairspace.saturn.TestUtils.ensureRecentInstant;
import static io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity.CREATED_BY_IRI;
import static io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity.DATE_CREATED_IRI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class MetadataEntityLifeCycleManagerTest {
    @Mock
    private PermissionsService permissionsService;

    private MetadataEntityLifeCycleManager lifeCycleManager;
    private Dataset ds;
    private Model model;

    private Node graph = NodeFactory.createURI("http://graph");
    private Node user = NodeFactory.createURI("http://user");
    private Resource userResource = ResourceFactory.createResource("http://user");

    private Resource resource = ResourceFactory.createResource("http://resource");
    private Property property = ResourceFactory.createProperty("http://property");
    private Property createdBy = ResourceFactory.createProperty(CREATED_BY_IRI);
    private Property dateCreated = ResourceFactory.createProperty(DATE_CREATED_IRI);
    private Resource otherResource = ResourceFactory.createResource("http://resource2");

    @Before
    public void setUp() throws Exception {
        ds = createTxnMem();
        model = ds.getNamedModel(graph.getURI());

        lifeCycleManager = new MetadataEntityLifeCycleManager(new RDFConnectionLocal(ds), graph, () -> user, permissionsService);
    }

    @Test
    public void testCreationInformationStorage() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, "test");
        delta.add(otherResource, property, "other-literal");

        lifeCycleManager.updateLifecycleMetadata(delta);

        assertTrue(model.contains(resource, createdBy, userResource));
        assertTrue(model.contains(otherResource, createdBy, userResource));

        String dateCreated = model.getRequiredProperty(resource, this.dateCreated).getString();
        ensureRecentInstant(Instant.parse(dateCreated));
    }

    @Test
    public void testCreationInformationStorageForObjects() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, otherResource);

        lifeCycleManager.updateLifecycleMetadata(delta);

        assertTrue(model.contains(otherResource, createdBy, userResource));

        String dateCreated = model.getRequiredProperty(otherResource, this.dateCreated).getString();
        ensureRecentInstant(Instant.parse(dateCreated));
    }

    @Test
    public void testStoreNotAddingCreationInformationForExistingEntities() {
        // Setup existing entity in model
        model.add(resource, createdBy, "someone else");

        // Try to add the information about the resource
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, "test");

        lifeCycleManager.updateLifecycleMetadata(delta);

        assertFalse(model.contains(resource, createdBy, userResource));
        assertFalse(model.contains(resource, dateCreated));
    }

    @Test
    public void testStorageOfEmptyModel() {
        lifeCycleManager.updateLifecycleMetadata(ModelFactory.createDefaultModel());
        lifeCycleManager.updateLifecycleMetadata(null);

        assertTrue(model.isEmpty());
    }

    @Test
    public void testStorageOfPermissions() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, otherResource);

        lifeCycleManager.updateLifecycleMetadata(delta);

        verify(permissionsService).createResource(NodeFactory.createURI(resource.getURI()));
        verify(permissionsService).createResource(NodeFactory.createURI(otherResource.getURI()));
    }
}
