package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

@RunWith(MockitoJUnitRunner.class)
public class ProtectMachineOnlyPredicatesValidatorTest {
    private static final Property MACHINE_ONLY_PROPERTY = FS.filePath;
    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");


    private ProtectMachineOnlyPredicatesValidator validator;

    @Mock
    private ViolationHandler violationHandler;

    @Before
    public void setUp() {
        var machineOnlyPropertyShape = createResource();
        var regularPropertyShape1 = createResource();
        var regularPropertyShape2 = createResource();
        validator = new ProtectMachineOnlyPredicatesValidator(createDefaultModel()
                .add(machineOnlyPropertyShape, SH.path, MACHINE_ONLY_PROPERTY)
                .add(machineOnlyPropertyShape, FS.machineOnly, createTypedLiteral(true))
                .add(regularPropertyShape1, SH.path, P1)
                .add(regularPropertyShape2, SH.path, P2)
                .add(regularPropertyShape2, FS.machineOnly, createTypedLiteral(false))
        );
    }

    @Test
    public void testContainsMachineOnlyPredicates() {
        // An empty model should pass
        Model testModel = createDefaultModel();

        // A machine-only property may be used as subject or object
        testModel.add(P1, RDF.type, RDF.Property);
        testModel.add(MACHINE_ONLY_PROPERTY, RDF.value, P1);

        // Other statements are allowed as well
        testModel.add(S1, P2, S2);
        testModel.add(S2, P2, S1);

        validator.validate(testModel, createDefaultModel(), violationHandler);
        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void testHasMachineOnlyPredicatesRecognizesMachineOnlyStatements() {
        // Create a model that contains one machine only statement between several non-machine-only
        Model testModel = createDefaultModel();
        testModel.add(S1, P2, S2);
        testModel.add(S2, P2, S1);
        testModel.add(S3, P2, S1);

        testModel.add(S3, MACHINE_ONLY_PROPERTY, S1);

        testModel.add(S2, P2, S3);
        testModel.add(S1, P2, S3);
        testModel.add(S3, P2, S2);

        validator.validate(testModel, createDefaultModel(), violationHandler);

        verify(violationHandler).onViolation("The given model contains a machine-only predicate",
                createStatement(S3, MACHINE_ONLY_PROPERTY, S1));
    }

    @Test
    public void testHasMachineOnlyPredicatesOnEmptyModel() {
        validator.validate(createDefaultModel(), createDefaultModel(), violationHandler);
        verifyZeroInteractions(violationHandler);
    }

}
