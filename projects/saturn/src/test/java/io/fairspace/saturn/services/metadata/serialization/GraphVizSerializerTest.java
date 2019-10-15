package io.fairspace.saturn.services.metadata.serialization;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;

public class GraphVizSerializerTest {
    private static final Resource RESOURCE = createResource("http://resource");
    private static final Resource RESOURCE2 = createResource("http://resource2");
    private static final Resource UNKNOWN_TYPE = createResource("http://unknown-type");
    private static final Resource RELATION_SHAPE = createResource("http://relation");
    private static final Resource RELATION_SHAPE2 = createResource("http://relation2");

    private GraphVizSerializer serializer;
    private Model model;

    @Before
    public void setUp() throws Exception {
        serializer = new GraphVizSerializer();
        model = createDefaultModel();
    }

    @Test
    public void testSerializationOfEmptyModel() {
        String dotNotation = serializer.serialize(model);

        assertTrue(getNodes(dotNotation).isEmpty());
        assertTrue(getEdges(dotNotation).isEmpty());
    }

    @Test
    public void testSerializationOfUnknownTypes() {
        model.add(RESOURCE, RDF.type, UNKNOWN_TYPE);
        model.add(RESOURCE2, RDF.type, UNKNOWN_TYPE);
        model.add(RESOURCE, RDFS.label, RESOURCE2);
        String dotNotation = serializer.serialize(model);

        assertTrue(getNodes(dotNotation).isEmpty());
        assertTrue(getEdges(dotNotation).isEmpty());
    }

    @Test
    public void testSerializationOfNodes() {
        model.add(RESOURCE, RDF.type, FS.ClassShape);
        model.add(RESOURCE, SH.targetClass, RESOURCE);
        model.add(RESOURCE, SH.name, "My first resource");
        model.add(RESOURCE2, RDF.type, FS.ClassShape);
        model.add(RESOURCE2, SH.targetClass, RESOURCE2);
        model.add(RESOURCE2, SH.name, "My second resource");

        String dotNotation = serializer.serialize(model);

        List<String> nodes = getNodes(dotNotation);

        assertEquals(2, nodes.size());
        assertTrue(nodes.stream().anyMatch(node ->
                node.startsWith("\"http://resource\"") && node.contains("label=\"My first resource\"")
        ));
        assertTrue(nodes.stream().anyMatch(node ->
                node.startsWith("\"http://resource2\"") && node.contains("label=\"My second resource\"")
        ));
    }

    @Test
    public void testHandlingOfMissingDataForNodes() {
        model.add(RESOURCE, RDF.type, FS.ClassShape);
        String dotNotation = serializer.serialize(model);

        assertTrue(getNodes(dotNotation).isEmpty());
    }

    @Test
    public void testHandlingOfMissingDataForEdges() {
        model.add(RESOURCE, RDF.type, FS.ClassShape);
        model.add(RESOURCE, SH.targetClass, RESOURCE);
        model.add(RESOURCE, SH.name, "My first resource");
        model.add(RESOURCE, SH.property, RELATION_SHAPE);
        String dotNotation = serializer.serialize(model);

        assertFalse(getNodes(dotNotation).isEmpty());
        assertTrue(getEdges(dotNotation).isEmpty());
    }

    @Test
    public void testSerializationOfEdges() {
        model.add(RESOURCE, RDF.type, FS.ClassShape);
        model.add(RESOURCE, SH.targetClass, RESOURCE);
        model.add(RESOURCE, SH.name, "My first resource");
        model.add(RESOURCE2, RDF.type, FS.ClassShape);
        model.add(RESOURCE2, SH.targetClass, RESOURCE2);
        model.add(RESOURCE2, SH.name, "My second resource");
        model.add(RESOURCE, SH.property, RELATION_SHAPE);
        model.add(RELATION_SHAPE, RDF.type, FS.RelationShape);
        model.add(RELATION_SHAPE, SH.name, "Relation");
        model.add(RELATION_SHAPE, SH.class_, RESOURCE2);

        model.add(RESOURCE2, SH.property, RELATION_SHAPE2);
        model.add(RELATION_SHAPE2, RDF.type, FS.RelationShape);
        model.add(RELATION_SHAPE2, SH.name, "Parent");
        model.add(RELATION_SHAPE2, SH.class_, RESOURCE2);

        String dotNotation = serializer.serialize(model);

        List<String> edges = getEdges(dotNotation);

        assertEquals(2, edges.size());
        assertTrue(edges.stream().anyMatch(edge ->
                edge.contains("label=\"Relation\"")
                        && !edge.contains("dir=\"both\"")
                        && edge.replaceAll("\\s+", "").contains("\"http://resource\"->\"http://resource2\"")
        ));
        assertTrue(edges.stream().anyMatch(edge ->
                edge.contains("label=\"Parent\"")
                        && !edge.contains("dir=\"both\"")
                        && edge.replaceAll("\\s+", "").contains("\"http://resource2\"->\"http://resource2\"")
        ));
    }

    @Test
    public void testSerializationOfBidirectionalEdges() {
        model.add(RESOURCE, RDF.type, FS.ClassShape);
        model.add(RESOURCE, SH.targetClass, RESOURCE);
        model.add(RESOURCE, SH.name, "My first resource");
        model.add(RESOURCE2, RDF.type, FS.ClassShape);
        model.add(RESOURCE2, SH.targetClass, RESOURCE2);
        model.add(RESOURCE2, SH.name, "My second resource");
        model.add(RESOURCE, SH.property, RELATION_SHAPE);
        model.add(RELATION_SHAPE, RDF.type, FS.RelationShape);
        model.add(RELATION_SHAPE, SH.name, "Relation");
        model.add(RELATION_SHAPE, SH.class_, RESOURCE2);
        model.add(RELATION_SHAPE, FS.inverseRelation, RELATION_SHAPE2);
        model.add(RELATION_SHAPE2, SH.name, "Relation2");
        model.add(RELATION_SHAPE2, SH.class_, RESOURCE);

        String dotNotation = serializer.serialize(model);

        List<String> edges = getEdges(dotNotation);

        assertEquals(1, edges.size());
        assertTrue(edges.get(0).contains("label=\"Relation\""));
        assertTrue(edges.get(0).replaceAll("\\s+", "").contains("\"http://resource\"->\"http://resource2\""));
    }

    private List<String> getNodes(String dotNotation) {
        return getLines(dotNotation)
                .filter(line -> line.matches("\\s*\".+\"\\s*\\[.+"))
                .collect(Collectors.toList());
    }

    private List<String> getEdges(String dotNotation) {
        return getLines(dotNotation)
                .filter(line -> line.matches("\\s*\".+\"\\s*->.+"))
                .collect(Collectors.toList());
    }

    private Stream<String> getLines(String dotNotation) {
        return dotNotation
                .replaceFirst("digraph \\{", "")
                .replaceFirst("}\\s*$", "")
                .trim()
                .lines()
                .map(String::trim);
    }

}
