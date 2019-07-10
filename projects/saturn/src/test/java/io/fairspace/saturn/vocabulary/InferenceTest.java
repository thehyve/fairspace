package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertTrue;

public class InferenceTest {
    private static final Resource shape = createResource();
    private static final Resource inverseShape = createResource();
    private static final Property property = createProperty("http://example.com/property");
    private static final Property inverseProperty = createProperty("http://example.com/inverseProperty");
    private static final Resource resource1 = createResource();
    private static final Resource resource2 = createResource();

    @Test
    public void applyInference() {
        var vocabulary = createDefaultModel()
                .add(shape, SH.path, property)
                .add(shape, FS.inverseRelation, inverseShape)
                .add(inverseShape, SH.path, inverseProperty);

        Inference.applyInference(META_VOCABULARY, vocabulary);
        assertTrue("fs:inverseRelation is inverse to itself", vocabulary.contains(inverseShape, FS.inverseRelation, shape));

        var model = createDefaultModel()
                .add(resource1, property, resource2);

        Inference.applyInference(vocabulary, model);

        assertTrue("Inversion works", model.contains(resource2, inverseProperty, resource1));
    }
}