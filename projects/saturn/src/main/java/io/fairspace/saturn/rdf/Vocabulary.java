package io.fairspace.saturn.rdf;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.util.FileManager;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.executeWrite;

@Slf4j
public class Vocabulary {
    private RDFConnection rdfConnection;

    private Node vocabularyGraph;

    public Vocabulary(RDFConnection rdfConnection, Node vocabularyGraph) {
        this.rdfConnection = rdfConnection;
        this.vocabularyGraph = vocabularyGraph;
    }

    public void initializeDefault(String filename) {
        commit("Initialize the vocabulary for " + vocabularyGraph.getURI(), rdfConnection, () -> {
            if(rdfConnection.fetch(vocabularyGraph.getURI()).isEmpty()) {
                log.info("Initializing vocabulary in graph {} with data from {}", vocabularyGraph.getURI(), filename);
                rdfConnection.load(vocabularyGraph.getURI(), FileManager.get().loadModel(filename));
            }
        });
    }

    public Model getMachineOnlyPredicates() {
        return rdfConnection.queryConstruct(storedQuery("machine_only_properties", vocabularyGraph));
    }

    public boolean isMachineOnlyPredicate(@NonNull String predicateUri) {
        return rdfConnection.queryAsk(storedQuery("is_machine_only_property", vocabularyGraph, createURI(predicateUri)));
    }

    public Node getVocabularyGraph() {
        return vocabularyGraph;
    }

}
