package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.XSD;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.rdf.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MetadataAndVocabularyConsistencyValidatorTest {
    private static final String NS = "http://example.com/";

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
    private MetadataAndVocabularyConsistencyValidator validator = new MetadataAndVocabularyConsistencyValidator(ds);

    private Model model = ds.getDefaultModel();
    private Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI());

    @Mock
    private ViolationHandler violationHandler;


    @Before
    public void setUp() {
        initVocabularies(ds);

        model.removeAll();
        vocabulary.add(TARGET_CLASS_SHAPE, SHACLM.targetClass, TARGET_CLASS);
        vocabulary.add(TARGET_CLASS_SHAPE, SHACLM.property, PROPERTY_SHAPE);
        vocabulary.add(PROPERTY_SHAPE, SHACLM.path, PROPERTY);
        model.add(ENTITY1, RDF.type, TARGET_CLASS);
    }

    @Test
    public void testValidateDataType() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.datatype, XSD.xint);
        model.add(ENTITY1, PROPERTY, createTypedLiteral(123));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral(false));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());
    }

    @Test
    public void testValidateClass() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.class_, CLASS1);

        model.add(ENTITY1, PROPERTY, ENTITY2)
         .add(ENTITY2, RDF.type, CLASS1);

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, ENTITY3)
                .add(ENTITY3, RDF.type, CLASS2);

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation("Value needs to have class http://example.com/Class1", ENTITY1, PROPERTY, ENTITY3);
    }

    @Test
    public void testValidateMinCount() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.minCount, createTypedLiteral(2));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());

        model.add(ENTITY1, PROPERTY, createTypedLiteral(1));

        validateNewConstraints(constraints);

        verify(violationHandler, times(2)).onViolation(any(), any(Resource.class), any(), any());

        model.add(ENTITY1, PROPERTY, createTypedLiteral(2));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void testValidateMaxCount() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.maxCount, createTypedLiteral(1));

        model.add(ENTITY1, PROPERTY, createTypedLiteral(1));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral(2));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());
    }

    @Test
    public void testValidateMinLength() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.minLength, createTypedLiteral(2));

        model.add(ENTITY1, PROPERTY, createTypedLiteral("12"));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral("1"));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());
    }

    @Test
    public void testValidateMaxLength() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.maxLength, createTypedLiteral(2));

        model.add(ENTITY1, PROPERTY, createTypedLiteral("12"));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createTypedLiteral("123"));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());
    }

    @Test
    public void testValidateIn() {
        var constraints = modelOf(PROPERTY_SHAPE, SHACLM.in, vocabulary.createList(createStringLiteral("a"), createStringLiteral("b")));

        model.add(ENTITY1, PROPERTY, createStringLiteral("a"));

        validateNewConstraints(constraints);

        verifyZeroInteractions(violationHandler);

        model.add(ENTITY1, PROPERTY, createStringLiteral("c"));

        validateNewConstraints(constraints);

        verify(violationHandler).onViolation(any(), any(Resource.class), any(), any());
    }

    private void validateNewConstraints(Model constraints) {
        validator.validate(model, model.union(constraints), EMPTY_MODEL, constraints, vocabulary, violationHandler);
    }
}
