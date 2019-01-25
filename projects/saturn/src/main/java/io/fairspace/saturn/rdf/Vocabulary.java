package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.util.FileManager;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.executeWrite;

public class Vocabulary {
    public static final Node VOCABULARY_GRAPH = createURI("http://fairspace.io/vocabulary");

    public static void init(DatasetGraph dsg) {
        executeWrite(dsg, () -> {
            if (!dsg.containsGraph(VOCABULARY_GRAPH)) {
                dsg.addGraph(VOCABULARY_GRAPH, FileManager.get().loadModel("vocabulary.jsonld").getGraph());
            }
        });
    }
}
