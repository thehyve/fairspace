package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.util.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MachineOnlyClassesValidatorTest {
    private static final Resource machineOnlyClass = createResource("http://example.com/MachineOnly");
    private static final Resource regularClass = createResource("http://example.com/Regular");
    private static final Resource machineOnlyClassShape = createResource("http://example.com/MachineOnlyShape");
    private static final Resource regularClassShape = createResource("http://example.com/RegularShape");
    private static final Resource machineOnlyInstance = createResource("http://example.com/123");
    private static final Resource regularInstance = createResource("http://example.com/345");
    private static final Model vocabulary = modelOf(
            regularClassShape, SH.targetClass, regularClass,
            machineOnlyClassShape, SH.targetClass, machineOnlyClass,
            machineOnlyClassShape, FS.machineOnly, createTypedLiteral(true));

    private MachineOnlyClassesValidator validator = new MachineOnlyClassesValidator();

    @Mock
    private ViolationHandler violationHandler;

    @Test
    public void machineOnlyClassesCannotBeInstantiated() {
        var model = modelOf(machineOnlyInstance, RDF.type, machineOnlyClass);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Trying to create a machine-only entity", createStatement(machineOnlyInstance, RDF.type, machineOnlyClass));
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void regularClassesCanBeInstantiated() {
        var model = modelOf(regularInstance, RDF.type, regularClass);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void machineOnlyClassesCannotBeRemoved() {
        var model = modelOf(machineOnlyInstance, RDF.type, machineOnlyClass);
        validator.validate(model, EMPTY_MODEL, model, EMPTY_MODEL, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Trying to change type of a machine-only entity", createStatement(machineOnlyInstance, RDF.type, machineOnlyClass));
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void regularClassesCannotBeRemoved() {
        var model = modelOf(regularInstance, RDF.type, regularClass);
        validator.validate(model, EMPTY_MODEL, model, EMPTY_MODEL, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);
    }
}