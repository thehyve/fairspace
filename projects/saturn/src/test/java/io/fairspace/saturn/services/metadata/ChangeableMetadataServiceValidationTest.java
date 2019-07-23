package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.ViolationHandler;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.TestUtils.isomorphic;
import static io.fairspace.saturn.util.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
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
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");
    private static final Resource CS1 = createResource("http://localhost/iri/ClassShape1");
    private static final Resource CS2 = createResource("http://localhost/iri/ClassShape2");
    private static final Resource PS1 = createResource("http://localhost/iri/PropertyShape1");
    private static final Resource PS2 = createResource("http://localhost/iri/PropertyShape2");
    private static final Property C1 = createProperty("http://fairspace.io/ontology/C1");
    private static final Property C2 = createProperty("http://fairspace.io/ontology/C2");

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
        api.put(modelOf(LBL_STMT1));

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
            ViolationHandler handler = invocation.getArgument(5);
            handler.onViolation("ERROR", createResource(), null, null);

            return null;
        }).when(validator).validate(any(), any(), any(), any(), any(), any());
    }

    @Test
    public void testPatchShouldSucceedOnValidationSuccess() {
        api.patch(modelOf(LBL_STMT1));

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
        api.patch(modelOf(STMT1));

        verify(validator).validate(any(), any(), argThat(Model::isEmpty), argThat(Model::isEmpty), any(), any());
    }

    @Test
    public void testSoftDeleteShouldSucceedOnValidationSuccess() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1));

        api.softDelete(S1);

        Model model = ds.getNamedModel(GRAPH);
        assertFalse(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void deleteShouldFailOnMachineOnValidationFailure() {
        produceValidationError();
        api.delete(modelOf(S1, P1, S2));
    }

    @Test
    public void testDeleteModelShouldSucceedOnValidationSuccess() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1));

        api.delete(modelOf(LBL_STMT1));

        Model model = ds.getNamedModel(GRAPH);
        assertFalse(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void deleteModelShouldNotAcceptMachineOnlyTriples() {
        produceValidationError();
        api.delete(createDefaultModel());
    }

    @Test
    public void validatedModelsContainSubjectTypes() {
        ds.replaceNamedModel(GRAPH, modelOf(S1, RDF.type, C1));

        var toAdd = modelOf(S1, P1, createTypedLiteral(1));

        api.put(toAdd);

        verify(validator).validate(
                isomorphic(modelOf(S1, RDF.type, C1)),
                isomorphic(modelOf(
                        S1, RDF.type, C1,
                        S1, P1, createTypedLiteral(1))),
                isomorphic(EMPTY_MODEL),
                isomorphic(toAdd),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }

    @Test
    public void validatedModelsContainObjectTypes() {
        ds.replaceNamedModel(GRAPH, modelOf(S2, RDF.type, C2));

        var toAdd = modelOf(S1, P1, S2);

        api.put(toAdd);

        verify(validator).validate(
                isomorphic(EMPTY_MODEL),
                isomorphic(modelOf(
                        S2, RDF.type, C2,
                        S1, P1, S2)),
                isomorphic(EMPTY_MODEL),
                isomorphic(toAdd),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }


    @Test
    public void validatedModelsContainInferredStatements() {
        ds.replaceNamedModel(GRAPH, modelOf(
                S1, RDF.type, C1,
                S2, RDF.type, C2));

        ds.replaceNamedModel(VOCABULARY, modelOf(
                CS1, SH.targetClass, C1,
                CS2, SH.targetClass, C2,
                CS1, SH.property, PS1,
                CS2, SH.property, PS2,
                PS1, SH.path, P1,
                PS1, FS.domainIncludes, CS1,
                PS1, FS.inverseRelation, PS2,
                PS2, SH.path, P2,
                PS1, FS.domainIncludes, CS2,
                PS2, FS.inverseRelation, PS1
        ));

        var toAdd = modelOf(S1, P1, S2);

        api.put(toAdd);

        verify(validator).validate(
                isomorphic(modelOf(
                        S1, RDF.type, C1,
                        S2, RDF.type, C2)),
                isomorphic(modelOf(
                        S1, RDF.type, C1,
                        S2, RDF.type, C2,
                        S1, P1, S2,
                        S2, P2, S1)),
                isomorphic(EMPTY_MODEL),
                isomorphic(modelOf(
                        S1, P1, S2,
                        S2, P2, S1)),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }
}

