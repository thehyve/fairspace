package io.fairspace.saturn.rdf.inversion;

import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;
import org.apache.jena.vocabulary.OWL;

import java.util.HashMap;
import java.util.Map;

import static io.fairspace.saturn.rdf.Vocabulary.VOCABULARY_GRAPH;
import static org.apache.jena.system.Txn.executeRead;

public class InvertingDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private static final Node inverseOf = OWL.inverseOf.asNode();

    private final Map<Node, Node> propertiesMap = new HashMap<>();

    public InvertingDatasetGraph(DatasetGraph dsg) {
        super(dsg);

        executeRead(dsg, () -> dsg.find(VOCABULARY_GRAPH, Node.ANY, inverseOf, Node.ANY)
                .forEachRemaining(quad -> {
                    propertiesMap.put(quad.getSubject(), quad.getObject());
                    propertiesMap.put(quad.getObject(), quad.getSubject());
                }));
    }

    @Override
    protected void change(QuadAction action, Node g, Node s, Node p, Node o) {
        switch (action) {
            case ADD:
                if (g.equals(VOCABULARY_GRAPH) && p.equals(inverseOf)) {
                    propertiesMap.put(s, o);
                    propertiesMap.put(o, s);
                }
                Node toAdd = propertiesMap.get(p);
                if (toAdd != null && !get().contains(g, o, toAdd, s)) {
                    get().add(g, o, toAdd, s);
                }
                break;
            case DELETE:
                if (g.equals(VOCABULARY_GRAPH) && p.equals(inverseOf)) {
                    propertiesMap.remove(s);
                    propertiesMap.remove(o);
                }
                Node toDelete = propertiesMap.get(p);
                if (toDelete != null && get().contains(g, o, toDelete, s)) {
                    get().delete(g, o, toDelete, s);
                }
                break;
        }
    }
}

