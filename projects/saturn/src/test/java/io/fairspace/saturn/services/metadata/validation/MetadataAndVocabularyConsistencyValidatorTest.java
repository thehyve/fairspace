package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
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
        var classShapeResource = createResource(FS.NS + "TestClassShape");
        var classResource = createResource(FS.NS + "TestClass");
        var propertyShapeResource = createResource(FS.NS + "testPropertyShape");
        var propertyResource = createProperty(FS.NS + "testProperty");
        var subject = createResource(FS.NS + "testSubject");

        ds.getDefaultModel()
                .add(subject, RDF.type, classResource)
                .add(subject, propertyResource, createStringLiteral("123"));


        var createNewClassShape = createDefaultModel()
                .add(classShapeResource, RDF.type, FS.ClassShape)
                .add(classShapeResource, SH.targetClass, classResource);


        var result = validator.validate(EMPTY, createNewClassShape);
        assertTrue(result.isValid());


        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()).add(createNewClassShape);


        var createNewPropertyShape = createDefaultModel()
                .add(propertyShapeResource, RDF.type, FS.PropertyShape)
                .add(propertyShapeResource, SH.path, propertyResource)
                .add(propertyShapeResource, SH.datatype, XSD.xstring);

        result = validator.validate(EMPTY, createNewPropertyShape);
        assertTrue(result.isValid());


        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()).add(createNewPropertyShape);

        var addPropertyShapeToClassShape = createDefaultModel()
                .add(classShapeResource, SH.property, propertyShapeResource);


        result = validator.validate(EMPTY, addPropertyShapeToClassShape);
        assertTrue(result.isValid());

        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()).add(addPropertyShapeToClassShape);

        var setMaxLength = createDefaultModel()
                .add(propertyShapeResource, SH.maxLength, createTypedLiteral(2));

        result = validator.validate(EMPTY, setMaxLength);
        assertFalse(result.isValid());
        assertEquals(Set.of("http://fairspace.io/ontology#testSubject http://fairspace.io/ontology#testProperty: Value has more than 2 characters."),
                result.getValidationMessages());
    }


}