package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.generateIri;
import static io.fairspace.saturn.rdf.Vocabulary.initializeVocabulary;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.calculateRead;
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
        var systemVocabulary = initializeVocabulary(rdf, generateIri("system-vocabulary"), "default-vocabularies/system-vocabulary.ttl");
        var userVocabulary = initializeVocabulary(rdf, generateIri("user-vocabulary"), "default-vocabularies/user-vocabulary.ttl");
        var affectedResourcesDetector = new AffectedResourcesDetector(systemVocabulary, userVocabulary);
        Supplier<Model> mergedVocabularySupplier = () -> calculateRead(rdf, () ->
                rdf.fetch(systemVocabulary.getVocabularyGraph().getURI())
                        .add(rdf.fetch(userVocabulary.getVocabularyGraph().getURI())));
        validator = new ShaclValidator(rdf, Quad.defaultGraphIRI, mergedVocabularySupplier,  affectedResourcesDetector::getAffectedResources);
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
                .add(resource1, RDF.type, createResource("http://fairspace.io/ontology#User"))
                .add(resource1, RDFS.label, createTypedLiteral(123))
                .add(resource1, RDFS.comment, createTypedLiteral(123)));

        assertFalse(result.isValid());
        assertEquals(2, result.getValidationMessages().size());
        assertTrue(result.getValidationMessages().contains("http://example.com/123 http://www.w3.org/2000/01/rdf-schema#label: Value does not have datatype xsd:string."));
        assertTrue(result.getValidationMessages().contains("http://example.com/123 http://www.w3.org/2000/01/rdf-schema#comment: Value does not have datatype xsd:string."));
    }

    @Test
    public void validateResourceWithUnknownProperty() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, createResource("http://fairspace.io/ontology#User"))
                .add(resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123)));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://example.com#unknown: Predicate <http://example.com#unknown> is not allowed (closed shape).", result.getMessage());
    }

    @Test
    public void validateResourceMissingRequiredProperty() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, createResource("http://fairspace.io/ontology#File")));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://fairspace.io/ontology#filePath: Less than 1 values.", result.getMessage());
    }

    @Test
    public void validateResourceWithWrongObjectsType() {
        var result = validator.validate(EMPTY, createDefaultModel()
                .add(resource1, RDF.type, createResource("http://fairspace.io/ontology#File")));

        assertFalse(result.isValid());
        assertEquals("http://example.com/123 http://fairspace.io/ontology#filePath: Less than 1 values.", result.getMessage());
    }
}