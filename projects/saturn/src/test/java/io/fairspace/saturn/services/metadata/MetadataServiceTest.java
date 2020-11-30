package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.UniqueLabelValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static io.fairspace.saturn.services.metadata.MetadataService.NIL;
import static io.fairspace.saturn.vocabulary.FS.NS;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class MetadataServiceTest {
    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);

    private Dataset ds = createTxnMem();

    private Transactions txn = new SimpleTransactions(ds);
    private MetadataService api;
    @Mock
    private MetadataPermissions permissions;

    @Before
    public void setUp() {
        setupRequestContext();
        when(permissions.canReadMetadata(any())).thenReturn(true);
        when(permissions.canWriteMetadata(any())).thenReturn(true);
        api = new MetadataService(txn, VOCABULARY, new ComposedValidator(new UniqueLabelValidator()), permissions);
    }

    @Test
    public void testPutWillAddStatements() {
        var delta = modelOf(STMT1, STMT2);

        api.put(delta);

        assertTrue(api.get(S1.getURI(), false).contains(STMT1));
        assertTrue(api.get(S2.getURI(), false).contains(STMT2));
    }

    @Test
    public void testPutHandlesLifecycleForEntities() {
        var delta = modelOf(STMT1);
        api.put(delta);
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.createdBy));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateCreated));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.modifiedBy));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateModified));
    }


    @Test
    public void testPutWillNotRemoveExistingStatements() {
        // Prepopulate the model
        final Statement EXISTING1 = createStatement(S1, P1, S3);
        final Statement EXISTING2 = createStatement(S2, P2, createPlainLiteral("test"));
        txn.executeWrite(m -> m.add(EXISTING1).add(EXISTING2));

        // Put new statements
        var delta = modelOf(STMT1, STMT2);
        api.put(delta);

        // Now ensure that the existing triples are still there
        // and the new ones are added
        txn.executeRead(model -> { ;
            assertTrue(model.contains(EXISTING1));
            assertTrue(model.contains(EXISTING2));
            assertTrue(model.contains(STMT1));
            assertTrue(model.contains(STMT2));
        });
    }

    @Test
    public void deleteModel() {
        txn.executeWrite(m -> m.add(STMT1).add(STMT2));

        api.delete(modelOf(STMT1));

        txn.executeRead(m -> {
            assertFalse(m.contains(STMT1));
            assertTrue(m.contains(STMT2));
        });
    }

    @Test
    public void patch() {
        txn.executeWrite(m -> m.add(STMT1).add(STMT2));

        Statement newStmt1 = createStatement(S1, P1, S3);
        Statement newStmt2 = createStatement(S2, P1, S1);
        Statement newStmt3 = createStatement(S1, P2, S3);

        api.patch(modelOf(newStmt1, newStmt2, newStmt3));

        txn.executeRead(m -> {
            assertTrue(m.contains(newStmt1));
            assertTrue(m.contains(newStmt2));
            assertTrue(m.contains(newStmt3));
            assertFalse(m.contains(STMT1));
            assertFalse(m.contains(STMT2));
        });
    }

    @Test
    public void patchWithNil() {
        txn.executeWrite(m -> m.add(S1, P1, S2).add(S1, P1, S3));

        api.patch(createDefaultModel().add(S1, P1, NIL));

        assertFalse(txn.calculateRead(m -> m.contains(S1, P1)));
    }

    @Test
    public void putMultiple() {
        api.put(modelOf(
                createStatement(S1, RDF.type, FS.Workspace),
                createStatement(S1, RDFS.label, createStringLiteral("Test 1"))
        ));
        api.put(modelOf(
                createStatement(S2, RDF.type, FS.Workspace),
                createStatement(S2, RDFS.label, createStringLiteral("Test 2"))
        ));
    }

    @Test(expected = ValidationException.class)
    public void putDuplicateLabelFails() {
        api.put(modelOf(
                createStatement(S1, RDF.type, FS.Workspace),
                createStatement(S1, RDFS.label, createStringLiteral("Test"))
                ));
        api.put(modelOf(
                createStatement(S2, RDF.type, FS.Workspace),
                createStatement(S2, RDFS.label, createStringLiteral("Test"))
        ));
    }

    @Test(expected = ValidationException.class)
    public void patchDuplicateLabelFails() {
        txn.executeWrite(m -> m
                .add(S1, RDF.type, FS.Workspace)
                .add(S1, RDFS.label, "Test 1")
                .add(S2, RDF.type, FS.Workspace)
                .add(S2, RDFS.label, "Test 2")
        );

        api.patch(modelOf(createStatement(S1, RDFS.label, createStringLiteral("Test 2 "))));
    }

    @Test(expected = ValidationException.class)
    public void patchDuplicateLabelWithWhitespaceFails() {
        txn.executeWrite(m -> m
                .add(S1, RDF.type, FS.Workspace)
                .add(S1, RDFS.label, "Test 1")
                .add(S2, RDF.type, FS.Workspace)
                .add(S2, RDFS.label, "Test 2")
        );

        api.patch(modelOf(createStatement(S1, RDFS.label, createStringLiteral(" Test 2  "))));
    }

    @Test
    public void putSameLabelDifferentType() {
        api.put(modelOf(
                createStatement(S1, RDF.type, FS.Workspace),
                createStatement(S1, RDFS.label, createStringLiteral("Test"))
        ));
        api.put(modelOf(
                createStatement(S2, RDF.type, createResource(NS + "Sample")),
                createStatement(S2, RDFS.label, createStringLiteral("Test"))
        ));
    }

    @Test
    public void putLabelTrimmed() {
        api.put(modelOf(
                createStatement(S1, RDF.type, FS.Workspace),
                createStatement(S1, RDFS.label, createStringLiteral(" Label with whitespace  "))
        ));
        assertNotEquals(" Label with whitespace  ", ds.getDefaultModel().getProperty(S1, RDFS.label).getString());
        assertEquals("Label with whitespace", ds.getDefaultModel().getProperty(S1, RDFS.label).getString());
    }

    @Test
    public void patchLabelTrimmed() {
        txn.executeWrite(m -> m.add(S1, RDFS.label, createStringLiteral("Label 1")));

        api.patch(createDefaultModel().add(S1, RDFS.label, createStringLiteral("Label 2 ")));

        assertEquals("Label 2", ds.getDefaultModel().getProperty(S1, RDFS.label).getString());
    }

    @Test
    public void testPatchHandlesLifecycleForEntities() {
        var delta = modelOf(STMT1);
        api.patch(delta);
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.modifiedBy));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateModified));
    }
}
