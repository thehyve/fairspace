package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class MetadataAndVocabularyConsistencyValidatorTest {
    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds);
    private MetadataAndVocabularyConsistencyValidator validator = new MetadataAndVocabularyConsistencyValidator(rdf);

    @Before
    public void setUp() {
        ds.getDefaultModel()
                .add(createResource("http://example.com/s1"), createProperty("http://example.com/p1"), createResource("http://example.com/o1"))
                .add(createResource("http://example.com/s2"), createProperty("http://example.com/p2"), createResource("http://example.com/o2"))
                .add(createResource("http://example.com/s3"), createProperty("http://example.com/p3"), createResource("http://example.com/o3"));
    }

    @Test
    public void testValidation() {
        var result = validator.validate(
                createDefaultModel()
                        .add(createResource("http://example.com/s1"), createProperty("http://example.com/x"), createResource("http://example.com/y"))
                        .add(createResource("http://example.com/p2"), createProperty("http://example.com/x"), createResource("http://example.com/y"))
                        .add(createResource("http://example.com/o3"), createProperty("http://example.com/x"), createResource("http://example.com/y")),
                createDefaultModel());

        assertFalse(result.isValid());
        assertEquals(Set.of(
                "Resource http://example.com/s1 has been used in metadata and cannot be altered.",
                "Resource http://example.com/p2 has been used in metadata and cannot be altered.",
                "Resource http://example.com/o3 has been used in metadata and cannot be altered."),
                result.getValidationMessages());
    }

    @Test
    public void testWhiteListed() {
        var result = validator.validate(
                createDefaultModel()
                        .add(createResource("http://example.com/s1"), RDFS.label, createStringLiteral("label"))
                        .add(createResource("http://example.com/s1"), RDFS.comment, createStringLiteral("comment"))
                        .add(createResource("http://example.com/s1"), SH.property, createResource("http://example.com/property")),
                createDefaultModel());

        assertTrue(result.isValid());
    }

    @Test
    public void testOnlySubjectsAreTestes() {
        var result = validator.validate(
                createDefaultModel()
                        .add(createResource("http://example.com/x"), createProperty("http://example.com/s1"), createResource("http://example.com/s2")),
                createDefaultModel());

        assertTrue(result.isValid());
    }
}