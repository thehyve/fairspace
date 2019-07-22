package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.util.ModelUtils.EMPTY;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;
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
        validator = new ProtectMachineOnlyPredicatesValidator(modelOf(
                machineOnlyPropertyShape, SH.path, MACHINE_ONLY_PROPERTY,
                machineOnlyPropertyShape, FS.machineOnly, createTypedLiteral(true),
                regularPropertyShape1, SH.path, P1,
                regularPropertyShape2, SH.path, P2,
                regularPropertyShape2, FS.machineOnly, createTypedLiteral(false))
        );
    }

    @Test
    public void testContainsMachineOnlyPredicates() {

        var testModel = modelOf(
        // A machine-only property may be used as subject or object
        P1, RDF.type, RDF.Property,
        MACHINE_ONLY_PROPERTY, RDF.value, P1,

        // Other statements are allowed as well
        S1, P2, S2,
        S2, P2, S1);

        validator.validate(EMPTY, testModel, testModel, EMPTY, EMPTY, violationHandler);
        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void testHasMachineOnlyPredicatesRecognizesMachineOnlyStatements() {
        // Create a model that contains one machine only statement between several non-machine-only
        var testModel = modelOf(
        S1, P2, S2,
        S2, P2, S1,
        S3, P2, S1,

        S3, RDF.type, FS.File,
        S3, MACHINE_ONLY_PROPERTY, S1,

        S2, P2, S3,
        S1, P2, S3,
        S3, P2, S2);

        validator.validate(EMPTY, EMPTY, EMPTY, testModel, SYSTEM_VOCABULARY, violationHandler);

        verify(violationHandler).onViolation("The given model contains a machine-only predicate",
                createStatement(S3, MACHINE_ONLY_PROPERTY, S1));
    }

    @Test
    public void testHasMachineOnlyPredicatesOnEmptyModel() {
        validator.validate(EMPTY, EMPTY, EMPTY, EMPTY, SYSTEM_VOCABULARY, violationHandler);
        verifyZeroInteractions(violationHandler);
    }

}
