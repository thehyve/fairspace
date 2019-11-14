package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;

import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
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
        var vocabulary = modelOf(
                classShape1, SHACLM.targetClass, class1,
                classShape1, SHACLM.property, propertyShape,
                classShape2, SHACLM.targetClass, class2,
                classShape2, SHACLM.property, inverseProperty,
                propertyShape, RDF.type, FS.RelationShape,
                propertyShape, SHACLM.path, property,
                propertyShape, FS.inverseRelation, inversePropertyShape,
                inversePropertyShape, RDF.type, FS.RelationShape,
                inversePropertyShape, SHACLM.path, inverseProperty);

        Inference.applyInference(META_VOCABULARY, vocabulary);
        assertTrue("fs:inverseRelation is inverse to itself", vocabulary.contains(inversePropertyShape, FS.inverseRelation, propertyShape));

        var model = modelOf(
                resource1, property, resource2,
                resource1, RDF.type, class1,
                resource2, RDF.type, class2);

        Inference.applyInference(vocabulary, model);

        assertTrue("Inversion works", model.contains(resource2, inverseProperty, resource1));
    }
}