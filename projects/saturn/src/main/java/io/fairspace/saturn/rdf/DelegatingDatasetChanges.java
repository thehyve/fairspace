package io.fairspace.saturn.rdf;

import lombok.Data;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.QuadAction;

@Data
class DelegatingDatasetChanges extends AbstractDatasetChanges {
    private GraphChangeListener changeListener;

    @Override
    public void change(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        var listener = changeListener;
        if (listener != null) {
            listener.onChange(action, graph, subject, predicate, object);
        }
    }
}
