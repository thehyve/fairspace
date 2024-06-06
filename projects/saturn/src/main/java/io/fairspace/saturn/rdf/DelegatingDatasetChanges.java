package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.QuadAction;

public class DelegatingDatasetChanges extends AbstractDatasetChanges {
    private GraphChangeListener changeListener;

    public DelegatingDatasetChanges() {}

    public DelegatingDatasetChanges(GraphChangeListener changeListener) {
        this.changeListener = changeListener;
    }

    public void setChangeListener(GraphChangeListener changeListener) {
        this.changeListener = changeListener;
    }

    @Override
    public void change(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        if (changeListener != null) {
            changeListener.onChange(action, graph, subject, predicate, object);
        }
    }
}
