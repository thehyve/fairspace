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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ProtectMachineOnlyPredicatesValidatorTest {
    private static final Property MACHINE_ONLY_PROPERTY = FS.filePath;
    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    @Mock
    private Supplier<List<String>> supplier;

    private ProtectMachineOnlyPredicatesValidator validator;

    @Before
    public void setUp() {
        validator = new ProtectMachineOnlyPredicatesValidator(supplier);
    }

    @Test
    public void testContainsMachineOnlyPredicates() {
        List<String> machineOnlyPredicates = Arrays.asList(MACHINE_ONLY_PROPERTY.getURI(), P1.getURI());
        when(supplier.get()).thenReturn(machineOnlyPredicates);

        // An empty model should pass
        Model testModel = createDefaultModel();

        // A machine-only property may be used as subject or object
        testModel.add(P1, RDF.type, RDF.Property);
        testModel.add(MACHINE_ONLY_PROPERTY, RDF.value, P1);

        // Other statements are allowed as well
        testModel.add(S1, P2, S2);
        testModel.add(S2, P2, S1);

        var result = validator.validate(testModel, createDefaultModel());
        assertTrue(result.isValid());
    }

    @Test
    public void testHasMachineOnlyPredicatesRecognizesMachineOnlyStatements() {
        List<String> machineOnlyPredicates = Arrays.asList(MACHINE_ONLY_PROPERTY.getURI(), P1.getURI());
        when(supplier.get()).thenReturn(machineOnlyPredicates);

        // Create a model that contains one machine only statement between several non-machine-only
        Model testModel = createDefaultModel();
        testModel.add(S1, P2, S2);
        testModel.add(S2, P2, S1);
        testModel.add(S3, P2, S1);

        testModel.add(S3, MACHINE_ONLY_PROPERTY, S1);

        testModel.add(S2, P2, S3);
        testModel.add(S1, P2, S3);
        testModel.add(S3, P2, S2);

        var result = validator.validate(testModel, createDefaultModel());
        assertFalse(result.isValid());
        assertEquals("The given model contains a machine-only predicate http://fairspace.io/ontology#filePath.", result.getMessage());
    }

    @Test
    public void testHasMachineOnlyPredicatesOnEmptyVocabulary() {
        when(supplier.get()).thenReturn(Collections.emptyList());

        // Create a model that contains one machine only statement between several non-machine-only
        Model testModel = createDefaultModel();
        testModel.add(S1, P2, S2);
        testModel.add(S2, P2, S1);
        testModel.add(S3, P2, S1);

        testModel.add(S3, MACHINE_ONLY_PROPERTY, S1);

        testModel.add(S2, P2, S3);
        testModel.add(S1, P2, S3);
        testModel.add(S3, P2, S2);

        var result = validator.validate(testModel, createDefaultModel());
        assertTrue(result.isValid());
    }

    @Test
    public void testHasMachineOnlyPredicatesOnEmptyModel() {
        assertTrue(validator.validate(createDefaultModel(), createDefaultModel()).isValid());
    }

}
