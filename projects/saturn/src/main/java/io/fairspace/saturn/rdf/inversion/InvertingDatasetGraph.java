package io.fairspace.saturn.rdf.inversion;

import io.fairspace.saturn.rdf.AbstractDatasetChanges;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.*;
import org.apache.jena.vocabulary.OWL;

import java.util.HashMap;
import java.util.Map;

import static io.fairspace.saturn.rdf.Vocabulary.VOCABULARY_GRAPH;
import static org.apache.jena.system.Txn.executeRead;

/**
 * A graph wrapper performing inference of inverse properties defined in the vocabulary.
 * It picks up new rules when they are added.
 */
public class InvertingDatasetGraph extends DatasetGraphMonitor {
    private static final Node inverseOf = OWL.inverseOf.asNode();

    private final Map<Node, Graph> graphs = new HashMap<>();


    public InvertingDatasetGraph(DatasetGraph dsg) {
        super(dsg, new Inverter(dsg));
    }

    @Override
    public Graph getDefaultGraph() {
        return getGraph(Quad.defaultGraphNodeGenerated);
    }

    @Override
    public Graph getGraph(Node graphNode) {
        return graphs.computeIfAbsent(graphNode, gn -> GraphView.createNamedGraph(this, gn));
    }

    private static class Inverter extends AbstractDatasetChanges {
        private final DatasetGraph dsg;
        private final Map<Node, Node> propertiesMap = new HashMap<>();

        private Inverter(DatasetGraph dsg) {
            this.dsg = dsg;
            // Load inversion rules from the dictionary
            executeRead(dsg, () -> dsg.find(VOCABULARY_GRAPH, Node.ANY, inverseOf, Node.ANY)
                    .forEachRemaining(quad -> {
                        propertiesMap.put(quad.getSubject(), quad.getObject());
                        propertiesMap.put(quad.getObject(), quad.getSubject());
                    }));
        }

        @Override
        public void change(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
            switch (action) {
                case ADD:
                    // A new inversion rule added?
                    if (graph.equals(VOCABULARY_GRAPH) && predicate.equals(inverseOf)) {
                        propertiesMap.put(subject, object);
                        propertiesMap.put(object, subject);
                    }
                    // Check if an inverse statement should be added as well
                    Node toAdd = propertiesMap.get(predicate);
                    if (toAdd != null && !dsg.contains(graph, object, toAdd, subject)) {
                        dsg.add(graph, object, toAdd, subject);
                    }
                    break;
                case DELETE:
                    // An inversion rule removed?
                    if (graph.equals(VOCABULARY_GRAPH) && predicate.equals(inverseOf)) {
                        propertiesMap.remove(subject);
                        propertiesMap.remove(object);
                    }
                    // Check if an inverse statement should be removed as well
                    Node toDelete = propertiesMap.get(predicate);
                    if (toDelete != null && dsg.contains(graph, object, toDelete, subject)) {
                        dsg.delete(graph, object, toDelete, subject);
                    }
                    break;
            }
        }
    }
}

