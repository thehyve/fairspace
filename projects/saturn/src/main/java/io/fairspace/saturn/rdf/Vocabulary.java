package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.util.FileManager;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.executeWrite;

public class Vocabulary {
    private RDFConnection rdfConnection;

    private Node vocabularyGraph;

    public Vocabulary(RDFConnection rdfConnection, Node vocabularyGraph) {
        this.rdfConnection = rdfConnection;
        this.vocabularyGraph = vocabularyGraph;
    }

    public Model getMachineOnlyPredicates() {
        return rdfConnection.queryConstruct(storedQuery("machine_only_properties", vocabularyGraph));
    }

    public static void initVocabulary(DatasetGraph dsg, Node vocabularyGraph) {
        withCommitMessage("Initialize the vocabulary", () ->
                executeWrite(dsg, () -> {
                    if (!dsg.containsGraph(vocabularyGraph)) {
                        dsg.addGraph(vocabularyGraph, FileManager.get().loadModel("vocabulary.jsonld").getGraph());
                    }
                }));
    }

    public boolean isMachineOnlyPredicate(String predicateUri) {
        if(predicateUri == null) {
            return false;
        }
        return rdfConnection.queryAsk(storedQuery("is_machine_only_property", vocabularyGraph, createURI(predicateUri)));
    }

    public Node getVocabularyGraph() {
        return vocabularyGraph;
    }

}
