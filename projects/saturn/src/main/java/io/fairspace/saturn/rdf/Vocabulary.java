package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.util.FileManager;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static org.apache.jena.system.Txn.executeWrite;

public class Vocabulary {
    public static void initVocabulary(DatasetGraph dsg, Node vocabularyGraph) {
        withCommitMessage("Initialize the vocabulary", () ->
                executeWrite(dsg, () -> {
                    if (!dsg.containsGraph(vocabularyGraph)) {
                        dsg.addGraph(vocabularyGraph, FileManager.get().loadModel("vocabulary.jsonld").getGraph());
                    }
                }));
    }
}
