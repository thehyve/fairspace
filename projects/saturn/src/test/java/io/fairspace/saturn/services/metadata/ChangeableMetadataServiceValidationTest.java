package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.ViolationHandler;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class ChangeableMetadataServiceValidationTest {
    @Mock
    MetadataRequestValidator validator;

    @Mock
    private MetadataEntityLifeCycleManager lifeCycleManager;

    private static final String GRAPH = "http://localhost/iri/graph";
    private static final String VOCABULARY = "http://localhost/iri/vocabulary";

    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");

    private static final Statement STMT1 = createStatement(S1, P1, S2);

    private static final Statement LBL_STMT1 = createStatement(S1, RDFS.label, createStringLiteral("subject1"));

    private Dataset ds;
    private ChangeableMetadataService api;

    @Before
    public void setUp() {
        ds = createTxnMem();
        RDFConnectionLocal rdf = new RDFConnectionLocal(ds);
        api = new ChangeableMetadataService(rdf, createURI(GRAPH), createURI(VOCABULARY), lifeCycleManager, validator);
    }

    @Test
    public void testPutShouldSucceedOnValidationSuccess() {
        api.put(createDefaultModel().add(LBL_STMT1));

        Model model = ds.getNamedModel(GRAPH);
        assertTrue(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void testPutShouldFailOnValidationError() {
        produceValidationError();

        api.put(createDefaultModel());
    }

    private void produceValidationError() {
        doAnswer(invocation -> {
            ViolationHandler handler = invocation.getArgument(2);
            handler.onViolation("ERROR", null, null, null);

            return null;
        }).when(validator).validate(any(), any(), any());
    }

    @Test
    public void testPatchShouldSucceedOnValidationSuccess() {
        api.patch(createDefaultModel().add(LBL_STMT1));

        Model model = ds.getNamedModel(GRAPH);
        assertTrue(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void patchShouldNotAcceptMachineOnlyTriples() {
        produceValidationError();
        api.patch(createDefaultModel());
    }

    @Test
    public void patchShouldNotValidateExistingTriples() {
        ds.getNamedModel(GRAPH).add(STMT1);
        api.patch(createDefaultModel().add(STMT1));

        verify(validator).validate(argThat(Model::isEmpty), argThat(Model::isEmpty), any());
    }

    @Test
    public void testDeleteShouldSucceedOnValidationSuccess() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1));

        api.delete(S1.getURI(), null, null);

        Model model = ds.getNamedModel(GRAPH);
        assertTrue(!model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void deleteShouldFailOnMachineOnValidationFailure() {
        produceValidationError();
        api.delete(S1.getURI(), P1.getURI(), S2.getURI());
    }

    @Test
    public void testDeleteModelShouldSucceedOnValidationSuccess() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1));

        api.delete(createDefaultModel().add(LBL_STMT1));

        Model model = ds.getNamedModel(GRAPH);
        assertFalse(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void deleteModelShouldNotAcceptMachineOnlyTriples() {
        produceValidationError();;
        api.delete(createDefaultModel());
    }
}
