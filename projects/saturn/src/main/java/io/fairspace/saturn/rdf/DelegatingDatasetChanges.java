package io.fairspace.saturn.rdf;

import lombok.Data;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.QuadAction;

@Data
class DelegatingDatasetChanges extends AbstractDatasetChanges {
    private ChangeListener changeListener;

    @Override
    public void change(QuadAction action, Node g, Node s, Node p, Node o) {
        ChangeListener listener = changeListener;
        if (listener != null) {
            listener.change(action, g, s, p, o);
        }
    }
}
