package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.*;

import java.util.HashMap;
import java.util.Map;

import static org.apache.jena.sparql.core.GraphView.createNamedGraph;
import static org.apache.jena.sparql.core.Quad.defaultGraphNodeGenerated;

public abstract class AbstractChangesAwareDatasetGraph extends DatasetGraphMonitor {
    private final Map<Node, Graph> graphs = new HashMap<>();

    public AbstractChangesAwareDatasetGraph(DatasetGraph dsg) {
        super(dsg, new DelegatingDatasetChanges(), true);

        ((DelegatingDatasetChanges) getMonitor()).setChangeListener(this::change);
    }

    protected void change(QuadAction action, Node g, Node s, Node p, Node o) {
    }

    @Override
    public Graph getDefaultGraph() {
        return getGraph(defaultGraphNodeGenerated);
    }

    @Override
    public Graph getGraph(Node graphNode) {
        return graphs.computeIfAbsent(graphNode, gn -> createNamedGraph(this, gn));
    }
}
