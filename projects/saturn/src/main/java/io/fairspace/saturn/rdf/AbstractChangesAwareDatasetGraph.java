package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.*;

import java.util.HashMap;
import java.util.Map;

import static org.apache.jena.sparql.core.GraphView.createNamedGraph;
import static org.apache.jena.sparql.core.Quad.defaultGraphNodeGenerated;

/**
 * A DatasetGraphMonitor which handles changes itself. Can be useful if changes-handling logic depends on Graph's state.
 * Also overrides getDefaultGraph and getGraph to avoid exposure of unwrapped graphs.
 */
public abstract class AbstractChangesAwareDatasetGraph extends DatasetGraphMonitor {
    private final Map<Node, Graph> graphs = new HashMap<>();

    public AbstractChangesAwareDatasetGraph(DatasetGraph dsg) {
        super(dsg, new DelegatingDatasetChanges(), true);

        ((DelegatingDatasetChanges) getMonitor()).setChangeListener(this::onChange);
    }

    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
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
