package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.sparqlunit.SparqlUnit.given;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class EntitiesByType {
    private static final Node GRAPH = createURI("http://example.com/graph");
    private static final Node VOCABULARY = createURI("http://example.com/vocabulary");

    private static final Resource CLASS_1 = createResource("http://example.com/class1");
    private static final Resource CLASS_2 = createResource("http://example.com/class2");
    private static final Resource CLASS_3 = createResource("http://example.com/class3");
    private static final Resource CLASS_4 = createResource("http://example.com/class4");

    private static final Resource CLASS_SHAPE_1 = createResource("http://example.com/classShape1");
    private static final Resource CLASS_SHAPE_2 = createResource("http://example.com/classShape2");
    private static final Resource CLASS_SHAPE_3 = createResource("http://example.com/classShape3");
    private static final Resource CLASS_SHAPE_4 = createResource("http://example.com/classShape3");

    private static final Resource ENTITY_1 = createResource("http://example.com/entity1");
    private static final Resource ENTITY_2 = createResource("http://example.com/entity2");
    private static final Resource ENTITY_3 = createResource("http://example.com/entity3");
    private static final Resource ENTITY_4 = createResource("http://example.com/entity4");

    private Dataset ds = DatasetFactory.create();

    @Before
    public void setUp() {
        // class2 extend class1
        // class3 extend class2
        // class4 does not extend anything
        // instances of class2 should not be shown
        ds.getNamedModel(VOCABULARY.getURI())
                .add(CLASS_2, RDFS.subClassOf, CLASS_1)
                .add(CLASS_3, RDFS.subClassOf, CLASS_2)
                .add(CLASS_SHAPE_1, SH.targetClass, CLASS_1)
                .add(CLASS_SHAPE_1, FS.showInCatalog, createTypedLiteral(true))
                .add(CLASS_SHAPE_2, SH.targetClass, CLASS_2)
                .add(CLASS_SHAPE_2, FS.showInCatalog, createTypedLiteral(false))
                .add(CLASS_SHAPE_3, SH.targetClass, CLASS_3)
                .add(CLASS_SHAPE_3, FS.showInCatalog, createTypedLiteral(true))
                .add(CLASS_SHAPE_4, SH.targetClass, CLASS_4)
                .add(CLASS_SHAPE_4, FS.showInCatalog, createTypedLiteral(true));

        ds.getNamedModel(GRAPH.getURI())
                .add(ENTITY_1, RDF.type, CLASS_1)
                .add(ENTITY_2, RDF.type, CLASS_2)
                .add(ENTITY_3, RDF.type, CLASS_3)
                .add(ENTITY_1, RDFS.label, "label")
                .add(ENTITY_4, RDF.type, CLASS_4);
    }

    @Test
    public void testListAllEntities() {
        given(ds).testConstruct(storedQuery("entities_by_type", GRAPH, VOCABULARY, null),
                model -> {
                    assertEquals("All entities those shapes have fs:showInCatalog should be returned",
                            Set.of(ENTITY_1, ENTITY_3, ENTITY_4),
                            model.listSubjects().toSet());
                    assertTrue("The result should include labels when possible", model.contains(ENTITY_1, RDFS.label));

                    assertEquals("Entities should have proper types", CLASS_3, model.getRequiredProperty(ENTITY_3, RDF.type).getResource());
                });
    }

    @Test
    public void testGetEntitiesByType() {
        given(ds).testConstruct(storedQuery("entities_by_type", GRAPH, VOCABULARY, CLASS_1),
                model -> assertEquals("Inheritance works all the way down",
                        Set.of(ENTITY_1, ENTITY_3),
                        model.listSubjects().toSet()));
    }
}
