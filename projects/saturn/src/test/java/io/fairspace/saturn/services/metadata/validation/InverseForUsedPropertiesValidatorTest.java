package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

public class InverseForUsedPropertiesValidatorTest {
    private static final Resource SHAPE1 = createResource("http://ex.com/shape1");
    private static final Resource SHAPE2 = createResource("http://ex.com/shape2");
    private static final Property PROPERTY1 = createProperty("http://ex.com/property1");
    private static final Property PROPERTY2 = createProperty("http://ex.com/property2");
    private static final Resource ENTITY1 = createResource("http://ex.com/entity1");
    private static final Resource ENTITY2 = createResource("http://ex.com/entity2");

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private final InverseForUsedPropertiesValidator validator = new InverseForUsedPropertiesValidator(rdf);


    @Test
    public void settingAnInverseForAnUnusedPropertyIsAllowed() {
        var result = validator.validate(createDefaultModel(),
                createDefaultModel()
                        .add(SHAPE1, SH.path, PROPERTY1)
                        .add(SHAPE2, SH.path, PROPERTY2)
                        .add(SHAPE1, FS.inverseRelation, SHAPE2)
                        .add(SHAPE2, FS.inverseRelation, SHAPE1));

        assertEquals(ValidationResult.VALID, result);
    }

    @Test
    public void settingAnInverseForAnUsedPropertyIsNotAllowed() {
        ds.getDefaultModel()
                .add(ENTITY1, PROPERTY1, ENTITY2)
                .add(ENTITY2, PROPERTY2, ENTITY1);

        var result = validator.validate(createDefaultModel(),
                createDefaultModel()
                        .add(SHAPE1, SH.path, PROPERTY1)
                        .add(SHAPE2, SH.path, PROPERTY2)
                        .add(SHAPE1, FS.inverseRelation, SHAPE2)
                        .add(SHAPE2, FS.inverseRelation, SHAPE1));

        assertFalse(result.isValid());
        assertEquals(Set.of("Cannot set fs:inverseRelation for http://ex.com/shape1, property http://ex.com/property1 has been used already.",
                "Cannot set fs:inverseRelation for http://ex.com/shape2, property http://ex.com/property2 has been used already."),
                result.getValidationMessages());
    }

    @Test
    public void unsettingAnInverseIsAlwaysAllowed() {
        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI())
                .add(SHAPE1, SH.path, PROPERTY1)
                .add(SHAPE2, SH.path, PROPERTY2)
                .add(SHAPE1, FS.inverseRelation, SHAPE2)
                .add(SHAPE2, FS.inverseRelation, SHAPE1);

        ds.getDefaultModel()
                .add(ENTITY1, PROPERTY1, ENTITY2)
                .add(ENTITY2, PROPERTY2, ENTITY1);


        var result = validator.validate(createDefaultModel()
                        .add(SHAPE1, FS.inverseRelation, SHAPE2)
                        .add(SHAPE2, FS.inverseRelation, SHAPE1),
                createDefaultModel());

        assertEquals(ValidationResult.VALID, result);
    }
}