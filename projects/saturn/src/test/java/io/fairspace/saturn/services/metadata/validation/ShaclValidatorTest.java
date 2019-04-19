package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import java.util.Set;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class ShaclValidatorTest {
    private static final Model EMPTY = createDefaultModel();
    private static final Resource resource1 = createResource("http://example.com/123");
    private static final Resource resource2 = createResource("http://example.com/234");

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds);
    private ShaclValidator validator;

    @Before
    public void setUp() {
        new Vocabularies(rdf);
        validator = new ShaclValidator(rdf, Quad.defaultGraphIRI, Vocabularies.VOCABULARY_GRAPH_URI);
    }


    @Test
    public void validateNoChanges() {
        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, EMPTY));
    }

    @Test
    public void validateResourceWithNoType() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDFS.label, createTypedLiteral(123)));

        assertTrue(result.isValid());
    }

    @Test
    public void validateResourceWithInvalidProperties() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, FS.User)
                .add(resource1, RDFS.label, createTypedLiteral(123))
                .add(resource1, RDFS.comment, createTypedLiteral(123)));

        assertFalse(result.isValid());
        assertEquals(Set.of("http://example.com/123 http://www.w3.org/2000/01/rdf-schema#comment 123^^http://www.w3.org/2001/XMLSchema#int - Value does not have datatype xsd:string.",
                "http://example.com/123 http://www.w3.org/2000/01/rdf-schema#label 123^^http://www.w3.org/2001/XMLSchema#int - Value does not have datatype xsd:string."),
                result.getValidationMessages());
     }

    @Test
    public void validateResourceWithUnknownProperty() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, FS.User)
                .add(resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123)));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://example.com#unknown 123^^http://www.w3.org/2001/XMLSchema#int - Predicate <http://example.com#unknown> is not allowed (closed shape).", result.getMessage());
    }

    @Test
    public void validateResourceMissingRequiredProperty() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, FS.File));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://fairspace.io/ontology#filePath  - Less than 1 values.", result.getMessage());
    }

    @Test
    public void validateResourceWithWrongObjectsType() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, FS.File));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://fairspace.io/ontology#filePath  - Less than 1 values.", result.getMessage());
    }

    @Test
    public void canPerformTypeChecks() {
        ds.getDefaultModel()
                .add(resource2, RDF.type, FS.User);

        var model = createDefaultModel()
                .add(resource1, RDF.type, FS.File)
                .add(resource1, FS.filePath, createStringLiteral("some/path"))
                .add(resource1, FS.createdBy, resource2);

        var result1 = validator.validate(EMPTY, model);

        assertTrue(result1.isValid());

        ds.getDefaultModel()
                .remove(resource2, RDF.type, FS.User)
                .add(resource2, RDF.type, FOAF.Person);

        var result2 = validator.validate(EMPTY, model);
        assertFalse(result2.isValid());
        assertEquals("http://example.com/123 http://fairspace.io/ontology#createdBy http://example.com/234 - Value does not have class fs:User.", result2.getMessage());
    }
}
