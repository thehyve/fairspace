package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.util.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;


@RunWith(MockitoJUnitRunner.class)
public class SystemVocabularyProtectingValidatorTest {
    private final SystemVocabularyProtectingValidator validator = new SystemVocabularyProtectingValidator();
    @Mock
    private ViolationHandler violationHandler;

    @Test
    public void itShouldNotBePossibleToDeleteStatementsFromTheSystemVocabulary() {
        var stmt = createStatement(createResource(FS.NS + "FileShape"), RDF.type, createResource(FS.NS + "ClassShape"));
        validator.validate(modelOf(stmt), EMPTY_MODEL, modelOf(stmt), EMPTY_MODEL, EMPTY_MODEL, violationHandler);


        verify(violationHandler).onViolation("Cannot remove a statement from the system vocabulary", stmt);
    }

    @Test
    public void itShouldBePossibleToAddNewShapes() {
        var model = modelOf(createResource("http://example.com/NewShape"), SH.property, createResource(FS.NS + "ClassShape"));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, EMPTY_MODEL, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void itShouldBePossibleToAddNewPropertiesToSystemShapes() {
        var model = modelOf(createResource(FS.NS + "FileShape"), SH.property, createProperty("http://example.com/property"));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, EMPTY_MODEL, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void itShouldNotBePossibleToAddArbitraryStatementsToTheSystemVocabulary() {
        var stmt = createStatement(createResource(FS.NS + "FileShape"), createProperty(FS.NS + "custom"), createStringLiteral("blah"));
        var model = modelOf(stmt);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, EMPTY_MODEL, violationHandler);

        verify(violationHandler).onViolation("Cannot add a statement modifying a shape from the system vocabulary", stmt);
    }

    @Test
    public void itIsNotPossibleToAddMachineOnlyProperties() {
        var stmt = createStatement(createResource(FS.createdBy +"Shape"), FS.domainIncludes, createResource("http://example.com/Test"));
        var model = modelOf(stmt);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, EMPTY_MODEL, violationHandler);

        verify(violationHandler).onViolation("Cannot add a machine-only property", stmt);
    }
}
