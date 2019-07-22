package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertTrue;

public class InferenceTest {
    private static final Resource classShape1 = createResource();
    private static final Resource classShape2 = createResource();
    private static final Resource propertyShape = createResource();
    private static final Resource inversePropertyShape = createResource();
    private static final Property property = createProperty("http://example.com/property");
    private static final Property inverseProperty = createProperty("http://example.com/inverseProperty");
    private static final Resource class1 = createResource();
    private static final Resource class2 = createResource();
    private static final Resource resource1 = createResource();
    private static final Resource resource2 = createResource();

    @Test
    public void applyInference() {
        var vocabulary = createDefaultModel()
                .add(classShape1, SH.targetClass, class1)
                .add(classShape1, SH.property, propertyShape)
                .add(classShape2, SH.targetClass, class2)
                .add(classShape2, SH.property, inverseProperty)
                .add(propertyShape, RDF.type, FS.RelationShape)
                .add(propertyShape, SH.path, property)
                .add(propertyShape, FS.inverseRelation, inversePropertyShape)
                .add(inversePropertyShape, RDF.type, FS.RelationShape)
                .add(inversePropertyShape, SH.path, inverseProperty);

        Inference.applyInference(META_VOCABULARY, vocabulary);
        assertTrue("fs:inverseRelation is inverse to itself", vocabulary.contains(inversePropertyShape, FS.inverseRelation, propertyShape));

        var model = createDefaultModel()
                .add(resource1, property, resource2)
                .add(resource1, RDF.type, class1)
                .add(resource2, RDF.type, class2);

        Inference.applyInference(vocabulary, model);

        assertTrue("Inversion works", model.contains(resource2, inverseProperty, resource1));
    }
}