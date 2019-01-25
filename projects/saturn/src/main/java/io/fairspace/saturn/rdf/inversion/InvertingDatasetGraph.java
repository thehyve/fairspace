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
            executeRead(dsg, () -> dsg.find(VOCABULARY_GRAPH, Node.ANY, inverseOf, Node.ANY)
                    .forEachRemaining(quad -> {
                        propertiesMap.put(quad.getSubject(), quad.getObject());
                        propertiesMap.put(quad.getObject(), quad.getSubject());
                    }));
        }

        @Override
        public void change(QuadAction action, Node g, Node s, Node p, Node o) {
            switch (action) {
                case ADD:
                    if (g.equals(VOCABULARY_GRAPH) && p.equals(inverseOf)) {
                        propertiesMap.put(s, o);
                        propertiesMap.put(o, s);
                    }
                    Node toAdd = propertiesMap.get(p);
                    if (toAdd != null && !dsg.contains(g, o, toAdd, s)) {
                        dsg.add(g, o, toAdd, s);
                    }
                    break;
                case DELETE:
                    if (g.equals(VOCABULARY_GRAPH) && p.equals(inverseOf)) {
                        propertiesMap.remove(s);
                        propertiesMap.remove(o);
                    }
                    Node toDelete = propertiesMap.get(p);
                    if (toDelete != null && dsg.contains(g, o, toDelete, s)) {
                        dsg.delete(g, o, toDelete, s);
                    }
                    break;
            }
        }
    }
}

