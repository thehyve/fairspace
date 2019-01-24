package io.fairspace.saturn.rdf.inversion;

import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.*;
import org.apache.jena.vocabulary.OWL;

import java.util.HashMap;
import java.util.Map;

import static io.fairspace.saturn.rdf.Vocabulary.VOCABULARY_GRAPH;
import static org.apache.jena.graph.NodeFactory.createURI;

class InvertingDatasetGraph extends DatasetGraphMonitor {
    private static final Node vocabulary = createURI(VOCABULARY_GRAPH);
    private static final Node inverseOf = OWL.inverseOf.asNode();

    private final Map<Node, Graph> graphs = new HashMap<>();


    InvertingDatasetGraph(DatasetGraph dsg) {
        super(dsg, new Inverter(dsg)) ;
    }

    @Override
    public Graph getDefaultGraph() {
        return getGraph(Quad.defaultGraphNodeGenerated) ;
    }

    @Override
    public Graph getGraph(Node graphNode) {
        return graphs.computeIfAbsent(graphNode, gn -> GraphView.createNamedGraph(this, gn)) ;
    }

    private static class Inverter implements DatasetChanges {
        private final DatasetGraph dsg;
        private final Map<Node, Node> propertiesMap = new HashMap<>();

        private Inverter(DatasetGraph dsg) {
            this.dsg = dsg;
        }

        @Override
        public void change(QuadAction action, Node g, Node s, Node p, Node o) {
            switch (action) {
                case ADD:
                    if (g.equals(vocabulary) && p.equals(inverseOf)) {
                        propertiesMap.put(s, o);
                        propertiesMap.put(o, s);
                    }
                    Node toAdd = propertiesMap.get(p);
                    if (toAdd != null && !dsg.contains(g, o, toAdd, s)) {
                        dsg.add(g, o, toAdd, s);
                    }
                    break;
                case DELETE:
                    if (g.equals(vocabulary) && p.equals(inverseOf)) {
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

        @Override
        public void start() {
        }

        @Override
        public void finish() {
        }

        @Override
        public void reset() {
        }
    }
}

