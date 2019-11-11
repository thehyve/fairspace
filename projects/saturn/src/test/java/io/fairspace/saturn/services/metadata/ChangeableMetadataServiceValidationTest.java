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

    private static final Resource resource1 = createResource("http://localhost/iri/S1");
    private static final Resource resource2 = createResource("http://localhost/iri/S2");
    private static final Property property1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property property2 = createProperty("http://fairspace.io/ontology/P2");
    private static final Resource classShape1 = createResource("http://localhost/iri/ClassShape1");
    private static final Resource classShape2 = createResource("http://localhost/iri/ClassShape2");
    private static final Resource propertyShape1 = createResource("http://localhost/iri/PropertyShape1");
    private static final Resource propertyShape2 = createResource("http://localhost/iri/PropertyShape2");
    private static final Property class1 = createProperty("http://fairspace.io/ontology/C1");
    private static final Property class2 = createProperty("http://fairspace.io/ontology/C2");

    private static final Statement STMT1 = createStatement(resource1, property1, resource2);

    private static final Statement LBL_STMT1 = createStatement(resource1, RDFS.label, createStringLiteral("subject1"));

    private Dataset ds;
    private ChangeableMetadataService api;

    @Before
    public void setUp() {
        ds = createTxnMem();
        RDFConnectionLocal rdf = new RDFConnectionLocal(ds);
        api = new ChangeableMetadataService(rdf, ds, createURI(GRAPH), createURI(VOCABULARY), 0, lifeCycleManager, validator, event -> {});
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
    public void testSoftDeleteShouldSucceedOnValidationSuccess() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1));

        api.softDelete(resource1);

        Model model = ds.getNamedModel(GRAPH);
        assertFalse(model.contains(LBL_STMT1));
    }

    @Test(expected = ValidationException.class)
    public void deleteShouldFailOnMachineOnValidationFailure() {
        produceValidationError();
        api.delete(modelOf(resource1, property1, resource2));
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
        ds.replaceNamedModel(GRAPH, modelOf(resource1, RDF.type, class1));

        var toAdd = modelOf(resource1, property1, createTypedLiteral(1));

        executeWrite(ds, () -> {
            api.put(toAdd);
            ds.abort();
        });

        verify(validator).validate(
                isomorphic(modelOf(resource1, RDF.type, class1)),
                isomorphic(modelOf(
                        resource1, RDF.type, class1,
                        resource1, property1, createTypedLiteral(1))),
                isomorphic(EMPTY_MODEL),
                isomorphic(toAdd),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }

    @Test
    public void validatedModelsContainObjectTypes() {
        ds.replaceNamedModel(GRAPH, modelOf(resource2, RDF.type, class2));

        var toAdd = modelOf(resource1, property1, resource2);

        executeWrite(ds, () -> {
            api.put(toAdd);
            ds.abort();
        });

        verify(validator).validate(
                isomorphic(modelOf(resource2, RDF.type, class2)),
                isomorphic(modelOf(
                        resource2, RDF.type, class2,
                        resource1, property1, resource2)),
                isomorphic(EMPTY_MODEL),
                isomorphic(toAdd),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }


    @Test
    public void validatedModelsContainInferredStatements() {
        ds.replaceNamedModel(GRAPH, modelOf(
                resource1, RDF.type, class1,
                resource2, RDF.type, class2));

        ds.replaceNamedModel(VOCABULARY, modelOf(
                classShape1, SH.targetClass, class1,
                classShape2, SH.targetClass, class2,
                classShape1, SH.property, propertyShape1,
                classShape2, SH.property, propertyShape2,
                propertyShape1, SH.path, property1,
                propertyShape1, FS.domainIncludes, classShape1,
                propertyShape1, FS.inverseRelation, propertyShape2,
                propertyShape2, SH.path, property2,
                propertyShape1, FS.domainIncludes, classShape2,
                propertyShape2, FS.inverseRelation, propertyShape1
        ));

        var toAdd = modelOf(resource1, property1, resource2);

        executeWrite(ds, () -> {
            api.put(toAdd);
            ds.abort();
        });

        verify(validator).validate(
                isomorphic(modelOf(
                        resource1, RDF.type, class1,
                        resource2, RDF.type, class2)),
                isomorphic(modelOf(
                        resource1, RDF.type, class1,
                        resource2, RDF.type, class2,
                        resource1, property1, resource2,
                        resource2, property2, resource1)),
                isomorphic(EMPTY_MODEL),
                isomorphic(modelOf(
                        resource1, property1, resource2,
                        resource2, property2, resource1)),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }

    @Test
    public void validatedModelsContainListElements() {
        var node1 = createResource();
        var node2 = createResource();
        var node3 = createResource();
        var modelWithList = modelOf(
                resource1, property1, node1,
                node1, RDF.first, createTypedLiteral(1),
                node1, RDF.rest, node2,
                node2, RDF.first, createTypedLiteral(2),
                node2, RDF.rest, node3,
                node3, RDF.first, resource2,
                resource2, RDF.type, class2,
                node3, RDF.rest, RDF.nil,
                resource2, RDF.type, class2);

        ds.replaceNamedModel(GRAPH, modelWithList);

        var toAdd = modelOf(resource1, property2, resource2);

        executeWrite(ds, () -> {
            api.put(toAdd);
            ds.abort();
        });

        verify(validator).validate(
                isomorphic(modelWithList),
                isomorphic(modelWithList.union(toAdd)),
                isomorphic(EMPTY_MODEL),
                isomorphic(toAdd),
                isomorphic(ds.getNamedModel(VOCABULARY)),
                any());
    }
}

