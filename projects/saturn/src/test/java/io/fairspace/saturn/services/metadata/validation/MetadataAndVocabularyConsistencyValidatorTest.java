package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.XSD;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.services.metadata.validation.MetadataAndVocabularyConsistencyValidator.MAX_SUBJECTS;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MetadataAndVocabularyConsistencyValidatorTest {
    private static final String NS = "http://example.com/";
    private static final Model EMPTY = createDefaultModel();

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private MetadataAndVocabularyConsistencyValidator validator = new MetadataAndVocabularyConsistencyValidator(rdf);
    @Mock
    private ViolationHandler violationHandler;

    private static final Resource classShapeResource = createResource(NS + "TestClassShape");
    private static final Resource classResource = createResource(NS + "TestClass");
    private static final Resource propertyShapeResource = createResource(NS + "testPropertyShape");
    private static final Property propertyResource = createProperty(NS + "testProperty");
    private static final Resource relationShapeResource = createResource(NS + "testRelationShape");
    private static final Property relationResource = createProperty(NS + "testRelation");
    private static final Resource subject = createResource(NS + "testSubject");
    private static final Resource object = createResource(NS + "testObject");

    @Before
    public void setUp() {
        initVocabularies(rdf);

        ds.getDefaultModel()
                .add(subject, RDF.type, classResource)
                .add(subject, propertyResource, createStringLiteral("123"))
                .add(subject, relationResource, object)
                .add(object, RDF.type, FOAF.Person);

        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI())
                .add(classShapeResource, RDF.type, FS.ClassShape)
                .add(classShapeResource, SH.targetClass, classResource)
                .add(propertyShapeResource, RDF.type, FS.PropertyShape)
                .add(propertyShapeResource, SH.datatype, XSD.xstring)
                .add(propertyShapeResource, SH.path, propertyResource)
                .add(classShapeResource, SH.property, propertyShapeResource);
    }

    @Test
    public void testPropertyValidation() {
        var addPropertyShapeToClassShape = createDefaultModel()
                .add(classShapeResource, SH.property, propertyShapeResource);

        validator.validate(EMPTY, addPropertyShapeToClassShape, violationHandler);
        verifyZeroInteractions(violationHandler);
        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()).add(addPropertyShapeToClassShape);

        var setMaxLength = createDefaultModel()
                .add(propertyShapeResource, SH.maxLength, createTypedLiteral(2));

        validator.validate(EMPTY, setMaxLength, violationHandler);
        verify(violationHandler).onViolation("Value has more than 2 characters", subject, propertyResource, createStringLiteral("123"));
        verifyNoMoreInteractions(violationHandler);
    }


    @Test
    public void testRelationValidation() {
        var addRelationShape = createDefaultModel()
                .add(relationShapeResource, RDF.type, FS.RelationShape)
                .add(relationShapeResource, SH.path, relationResource)
                .add(relationShapeResource, SH.class_, FOAF.Document)
                .add(classShapeResource, SH.property, relationShapeResource);

        validator.validate(EMPTY, addRelationShape, violationHandler);
        verify(violationHandler, atLeast(1)).onViolation("Value does not have class <http://xmlns.com/foaf/0.1/Document>", subject, relationResource, object);
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void tesShapeValidation() {
        var markAsClosed = createDefaultModel()
                .add(classShapeResource, createProperty(SH.NS + "closed"), createTypedLiteral(true));

        validator.validate(EMPTY, markAsClosed, violationHandler);
        verify(violationHandler).onViolation("Predicate <http://example.com/testRelation> is not allowed (closed shape)", subject, relationResource, object);
        verify(violationHandler).onViolation("Predicate <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> is not allowed (closed shape)", subject, RDF.type, classResource);
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void testNoMoreThanMaxSubjectsViolations() {
        for (int i = 0; i < 2 * MAX_SUBJECTS; i++) {
            var subject =  createResource(NS + i);
            ds.getDefaultModel()
                    .add(subject, RDF.type, classResource)
                    .add(subject, propertyResource, createStringLiteral("123"))
                    .add(subject, relationResource, object)
                    .add(object, RDF.type, FOAF.Person);

        }

        var setMaxLength = createDefaultModel()
                .add(propertyShapeResource, SH.maxLength, createTypedLiteral(2));

        validator.validate(EMPTY, setMaxLength, violationHandler);

        verify(violationHandler, times(MAX_SUBJECTS)).onViolation(any(), any(), any(), any());
        verifyNoMoreInteractions(violationHandler);
    }
}
