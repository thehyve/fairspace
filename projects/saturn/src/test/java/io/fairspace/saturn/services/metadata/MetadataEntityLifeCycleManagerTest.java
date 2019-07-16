package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.Instant;
import java.util.Set;

import static io.fairspace.saturn.TestUtils.ensureRecentInstant;
import static io.fairspace.saturn.vocabulary.FS.createdBy;
import static io.fairspace.saturn.vocabulary.FS.dateCreated;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

@RunWith(MockitoJUnitRunner.class)
public class MetadataEntityLifeCycleManagerTest {
    @Mock
    private PermissionsService permissionsService;

    private MetadataEntityLifeCycleManager lifeCycleManager;
    private Dataset ds;
    private Model model;

    private Node graph = NodeFactory.createURI("http://graph");
    private Node user = NodeFactory.createURI("http://user");
    private Resource userResource = createResource("http://user");

    private Resource resource = createResource("http://resource");
    private Property property = ResourceFactory.createProperty("http://property");
    private Resource otherResource = createResource("http://resource2");

    @Before
    public void setUp() {
        ds = createTxnMem();
        model = ds.getNamedModel(graph.getURI());

        var rdf = new RDFConnectionLocal(ds, Isolation.COPY);
        initVocabularies(rdf);
        lifeCycleManager = new MetadataEntityLifeCycleManager(rdf, graph, VOCABULARY_GRAPH_URI, () -> user, permissionsService);
    }

    @Test
    public void testCreationInformationStorage() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, "test");
        delta.add(otherResource, property, "other-literal");

        lifeCycleManager.updateLifecycleMetadata(delta);

        assertTrue(model.contains(resource, createdBy, userResource));
        assertTrue(model.contains(otherResource, createdBy, userResource));

        String dateCreatedValue = model.getRequiredProperty(resource, dateCreated).getString();
        ensureRecentInstant(Instant.parse(dateCreatedValue));
    }

    @Test
    public void testCreationInformationStorageForObjects() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, otherResource);

        lifeCycleManager.updateLifecycleMetadata(delta);

        assertTrue(model.contains(otherResource, createdBy, userResource));

        String dateCreatedValue = model.getRequiredProperty(otherResource, dateCreated).getString();
        ensureRecentInstant(Instant.parse(dateCreatedValue));
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
    public void testStorageOfBlankNodes() {
        // Try to add the information about the resource
        Model delta = ModelFactory.createDefaultModel();
        delta.add(createResource(), property, "test");

        lifeCycleManager.updateLifecycleMetadata(delta);

        // Expect no information to be added for blank nodes
        assertTrue(model.isEmpty());
    }

    @Test
    public void testStorageOfPermissions() {
        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, otherResource);

        lifeCycleManager.updateLifecycleMetadata(delta);

        verify(permissionsService).createResources(Set.of(resource, otherResource));
    }

    @Test
    public void testMissingPermissionsService() {
        lifeCycleManager = new MetadataEntityLifeCycleManager(new RDFConnectionLocal(ds), graph, VOCABULARY_GRAPH_URI, () -> user);

        Model delta = ModelFactory.createDefaultModel();
        delta.add(resource, property, otherResource);

        lifeCycleManager.updateLifecycleMetadata(delta);

        // Ensure correct storage of creation information
        assertTrue(model.contains(resource, createdBy, userResource));
        assertTrue(model.contains(otherResource, createdBy, userResource));

        // Ensure any permissions are ignored
        verifyZeroInteractions(permissionsService);
    }

    @Test
    public void testSoftDelete() {
        model.add(resource, RDFS.label, createStringLiteral("label"));
        lifeCycleManager.softDelete(resource);

        assertTrue(model.contains(resource, FS.dateDeleted));
        assertTrue(model.contains(resource, FS.deletedBy, createResource(user.getURI())));
    }

    @Test
    public void testSoftDeleteDoesNotDeleteSystemEntities() {
        model.add(resource, RDF.type, FS.File);
        lifeCycleManager.softDelete(resource);

        assertFalse(model.contains(resource, FS.dateDeleted));
        assertFalse(model.contains(resource, FS.deletedBy, createResource(user.getURI())));
    }
}
