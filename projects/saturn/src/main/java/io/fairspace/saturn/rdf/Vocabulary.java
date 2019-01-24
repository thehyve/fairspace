package io.fairspace.saturn.rdf;

import org.apache.jena.query.Dataset;
import org.apache.jena.util.FileManager;

import static org.apache.jena.system.Txn.executeWrite;

public class Vocabulary {
    public static final String VOCABULARY_GRAPH = "http://fairspace.io/vocabulary";

    public static void init(Dataset ds) {
        executeWrite(ds, () -> {
            if (!ds.containsNamedModel(VOCABULARY_GRAPH)) {
                ds.addNamedModel(VOCABULARY_GRAPH, FileManager.get().loadModel("vocabulary.jsonld"));
            }
        });
    }
}
