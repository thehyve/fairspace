package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.XSD;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MetadataAndVocabularyConsistencyValidatorTest {
    private static final String NS = "http://example.com/";
    private static final Model EMPTY = createDefaultModel();
    private static final Resource TARGET_CLASS = createResource(NS + "TestClass");
    private static final Resource TARGET_CLASS_SHAPE = createResource();
    private static final Resource ENTITY1 = createResource();
    private static final Resource ENTITY2 = createResource();
    private static final Resource ENTITY3 = createResource();
    private static final Property PROPERTY = createProperty(NS + "property");
    private static final Resource PROPERTY_SHAPE = createResource();
    private static final Resource CLASS1 = createResource(NS + "Class1");
    private static final Resource CLASS2 = createResource(NS + "Class2");

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private MetadataAndVocabularyConsistencyValidator validator = new MetadataAndVocabularyConsistencyValidator(rdf);

    private Model model = ds.getDefaultModel();
    private Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI());

    @Mock
    private ViolationHandler violationHandler;


    @Before
    public void setUp() {
        initVocabularies(rdf);

        model.removeAll();
        vocabulary.add(TARGET_CLASS_SHAPE, SH.targetClass, TARGET_CLASS);
        vocabulary.add(TARGET_CLASS_SHAPE, SH.property, PROPERTY_SHAPE);
        vocabulary.add(PROPERTY_SHAPE, SH.path, PROPERTY);
        model.add(ENTITY1, RDF.type, TARGET_CLASS);
    }

    @Test
    public void testValidateDataType() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.datatype, XSD.xint);
        model.add(ENTITY1, PROPERTY, createTypedLiteral(123));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral(false));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());
    }

    @Test
    public void testValidateClass() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.class_, CLASS1);

        model.add(ENTITY1, PROPERTY, ENTITY2)
         .add(ENTITY2, RDF.type, CLASS1);

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, ENTITY3)
                .add(ENTITY3, RDF.type, CLASS2);

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation("Value needs to have class http://example.com/Class1", ENTITY1, PROPERTY, ENTITY3);
    }

    @Test
    public void testValidateMinCount() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.minCount, createTypedLiteral(2));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());

        model.add(ENTITY1, PROPERTY, createTypedLiteral(1));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler, times(2)).onViolation(any(), any(), any(), any());

        model.add(ENTITY1, PROPERTY, createTypedLiteral(2));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void testValidateMaxCount() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.maxCount, createTypedLiteral(1));

        model.add(ENTITY1, PROPERTY, createTypedLiteral(1));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral(2));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());
    }

    @Test
    public void testValidateMinLength() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.minLength, createTypedLiteral(2));

        model.add(ENTITY1, PROPERTY, createTypedLiteral("12"));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral("1"));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());
    }

    @Test
    public void testValidateMaxLength() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.maxLength, createTypedLiteral(2));

        model.add(ENTITY1, PROPERTY, createTypedLiteral("12"));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral("123"));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());
    }

    @Test
    public void testValidateIn() {
        var constraints = createDefaultModel()
                .add(PROPERTY_SHAPE, SH.in, vocabulary.createList(createStringLiteral("a"), createStringLiteral("b")));

        model.add(ENTITY1, PROPERTY, createStringLiteral("a"));

        validator.validate(EMPTY, constraints, violationHandler);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createStringLiteral("c"));

        validator.validate(EMPTY, constraints, violationHandler);

        verify(violationHandler).onViolation(any(), any(), any(), any());
    }
}
