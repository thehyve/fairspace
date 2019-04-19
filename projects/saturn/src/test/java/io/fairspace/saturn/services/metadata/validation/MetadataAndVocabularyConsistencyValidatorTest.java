package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
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
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class MetadataAndVocabularyConsistencyValidatorTest {
    private static final String NS = "http://example.com/";
    private static final Model EMPTY = createDefaultModel();

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private MetadataAndVocabularyConsistencyValidator validator = new MetadataAndVocabularyConsistencyValidator(rdf);

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
        new Vocabularies(rdf);

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


        var result = apply(addPropertyShapeToClassShape);
        assertTrue(result.isValid());

        var setMaxLength = createDefaultModel()
                .add(propertyShapeResource, SH.maxLength, createTypedLiteral(2));

        result = validator.validate(EMPTY, setMaxLength);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/testSubject http://example.com/testProperty 123 - Value has more than 2 characters."),
                result.getValidationMessages());
    }


    @Test
    public void testRelationValidation() {
        var addRelationShape = createDefaultModel()
                .add(relationShapeResource, RDF.type, FS.RelationShape)
                .add(relationShapeResource, SH.path, relationResource)
                .add(relationShapeResource, SH.class_, FOAF.Document)
                .add(classShapeResource, SH.property, relationShapeResource);

        var result = apply(addRelationShape);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/testSubject http://example.com/testRelation http://example.com/testObject - Value does not have class <http://xmlns.com/foaf/0.1/Document>."),
                result.getValidationMessages());
    }

    @Test
    public void tesShapeValidation() {
        var markAsClosed = createDefaultModel()
                .add(classShapeResource, createProperty(SH.NS + "closed"), createTypedLiteral(true));

        var result = apply(markAsClosed);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/testSubject http://example.com/testRelation http://example.com/testObject - Predicate <http://example.com/testRelation> is not allowed (closed shape).",
                "http://example.com/testSubject http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://example.com/TestClass - Predicate <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> is not allowed (closed shape)."),
                result.getValidationMessages());
    }

    private ValidationResult apply(Model changes) {
        var result = validator.validate(EMPTY, changes);
        if (result.isValid()) {
            ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()).add(changes);
        }
        return result;
    }
}