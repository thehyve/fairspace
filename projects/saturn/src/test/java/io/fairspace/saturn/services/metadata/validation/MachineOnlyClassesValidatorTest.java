package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MachineOnlyClassesValidatorTest {

    private static final Resource machineOnlyClass = createResource("http://example.com/MachineOnly");
    private static final Resource regularClass = createResource("http://example.com/Regular");
    private static final Resource machineOnlyClassShape = createResource("http://example.com/MachineOnlyShape");
    private static final Resource regularClassShape = createResource("http://example.com/RegularShape");
    private static final Resource machineOnlyInstance = createResource("http://example.com/123");
    private static final Resource regularInstance = createResource("http://example.com/345");

    private MachineOnlyClassesValidator validator;

    @Mock
    private ViolationHandler violationHandler;

    @Before
    public void before() {
        var ds = DatasetFactory.create();
        ds.getNamedModel(Vocabularies.VOCABULARY_GRAPH_URI.getURI())
                .add(regularClassShape, SH.targetClass, regularClass)
                .add(machineOnlyClassShape, SH.targetClass, machineOnlyClass)
                .addLiteral(machineOnlyClassShape, FS.machineOnly, true);

        validator = new MachineOnlyClassesValidator(new RDFConnectionLocal(ds));
    }

    @Test
    public void machineOnlyClassesCannotBeInstantiated() {
        validator.validate(createDefaultModel(), createDefaultModel().add(machineOnlyInstance, RDF.type, machineOnlyClass), violationHandler);

        verify(violationHandler).onViolation("Trying to create a machine-only entity", createStatement(machineOnlyInstance, RDF.type, machineOnlyClass));
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void regularClassesCannotBeInstantiated() {
        validator.validate(createDefaultModel(), createDefaultModel().add(regularInstance, RDF.type, regularClass), violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void machineOnlyClassesCannotBeRemoved() {
        validator.validate(createDefaultModel().add(machineOnlyInstance, RDF.type, machineOnlyClass), createDefaultModel(),  violationHandler);

        verify(violationHandler).onViolation("Trying to change type of a machine-only entity", createStatement(machineOnlyInstance, RDF.type, machineOnlyClass));
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void regularClassesCannotBeRemoved() {
        validator.validate(createDefaultModel().add(regularInstance, RDF.type, regularClass), createDefaultModel(),  violationHandler);

        verifyZeroInteractions(violationHandler);
    }

}