package io.fairspace.saturn.rdf.inversion;

import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;
import org.apache.jena.vocabulary.OWL;

import java.util.HashMap;
import java.util.Map;

import static org.apache.jena.system.Txn.executeRead;

/**
 * A graph wrapper performing inference of inverse properties defined in the vocabulary.
 * It picks up new rules when they are added.
 */
public class InvertingDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private static final Node inverseOf = OWL.inverseOf.asNode();

    private final Map<Node, Node> propertiesMap = new HashMap<>();
    private final Node vocabularyGraph;

    public InvertingDatasetGraph(DatasetGraph dsg, Node vocabularyGraph) {
        super(dsg);

        this.vocabularyGraph = vocabularyGraph;

        // Load inversion rules from the dictionary
        executeRead(dsg, () -> dsg.find(vocabularyGraph, Node.ANY, inverseOf, Node.ANY)
                .forEachRemaining(quad -> {
                    propertiesMap.put(quad.getSubject(), quad.getObject());
                    propertiesMap.put(quad.getObject(), quad.getSubject());
                }));
    }

    @Override
    protected void change(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        switch (action) {
            case ADD:
                // A new inversion rule added?
                    if (graph.equals(vocabularyGraph) && predicate.equals(inverseOf)) {
                        propertiesMap.put(subject, object);
                        propertiesMap.put(object, subject);
                }
                // Check if an inverse statement should be added as well
                Node toAdd = propertiesMap.get(predicate);
                if (toAdd != null && !get().contains(graph, object, toAdd, subject)) {
                    get().add(graph, object, toAdd, subject);
                }
                break;
            case DELETE:
                // An inversion rule removed?
                    if (graph.equals(vocabularyGraph) && predicate.equals(inverseOf)) {
                        propertiesMap.remove(subject);
                        propertiesMap.remove(object);
                }
                // Check if an inverse statement should be removed as well
                Node toDelete = propertiesMap.get(predicate);
                if (toDelete != null && get().contains(graph, object, toDelete, subject)) {
                    get().delete(graph, object, toDelete, subject);
                }
                break;
        }
    }
}

