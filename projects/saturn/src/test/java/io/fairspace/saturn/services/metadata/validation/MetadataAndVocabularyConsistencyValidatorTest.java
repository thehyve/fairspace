package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
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

    @Before
    public void setUp() {
        new Vocabularies(rdf);
    }

    @Test
    public void testValidation() {
        var classShapeResource = createResource(NS + "TestClassShape");
        var classResource = createResource(NS + "TestClass");
        var propertyShapeResource = createResource(NS + "testPropertyShape");
        var propertyResource = createProperty(NS + "testProperty");
        var relationShapeResource = createResource(NS + "testRelationShape");
        var relationResource = createProperty(NS + "testRelation");
        var subject = createResource(NS + "testSubject");
        var object = createResource(NS + "testObject");


        ds.getDefaultModel()
                .add(subject, RDF.type, classResource)
                .add(subject, propertyResource, createStringLiteral("123"))
                .add(subject, relationResource, object)
                .add(object, RDF.type, FOAF.Person);


        var createNewClassShape = createDefaultModel()
                .add(classShapeResource, RDF.type, FS.ClassShape)
                .add(classShapeResource, SH.targetClass, classResource);


        var result = apply(createNewClassShape);
        assertTrue(result.isValid());


        var createNewPropertyShape = createDefaultModel()
                .add(propertyShapeResource, RDF.type, FS.PropertyShape)
                .add(propertyShapeResource, SH.datatype, XSD.xstring)
                .add(propertyShapeResource, SH.path, propertyResource);

        result = apply(createNewPropertyShape);
        assertTrue(result.isValid());

        var addPropertyShapeToClassShape = createDefaultModel()
                .add(classShapeResource, SH.property, propertyShapeResource);


        result = apply(addPropertyShapeToClassShape);
        assertTrue(result.isValid());

        var setMaxLength = createDefaultModel()
                .add(propertyShapeResource, SH.maxLength, createTypedLiteral(2));

        result = validator.validate(EMPTY, setMaxLength);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/testSubject http://example.com/testProperty: Value has more than 2 characters."),
                result.getValidationMessages());



        var addRelationShape = createDefaultModel()
                .add(relationShapeResource, RDF.type, FS.RelationShape)
                .add(relationShapeResource, SH.path, relationResource)
                .add(relationShapeResource, SH.class_, FOAF.Document)
                .add(classShapeResource, SH.property, relationShapeResource);

        result = apply(addRelationShape);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/testSubject http://example.com/testRelation: Value does not have class <http://xmlns.com/foaf/0.1/Document>."),
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