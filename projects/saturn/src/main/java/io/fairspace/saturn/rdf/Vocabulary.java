package io.fairspace.saturn.rdf;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.util.FileManager;

import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static org.apache.jena.graph.NodeFactory.createURI;

@Slf4j
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Vocabulary {
    private final RDFConnection rdfConnection;
    private final Node vocabularyGraph;

    /**
     * Returns a list with all predicate URIs that are marked machine-only in the vocabulary
     * @return
     */
    public List<String> getMachineOnlyPredicates() {
        var processor = new QuerySolutionProcessor<>(row -> row.getResource("property").getURI());

        rdfConnection.querySelect(storedQuery("machine_only_properties", vocabularyGraph), processor);

        return processor.getValues();
    }

    public boolean isInvertiblePredicate(@NonNull String predicateUri) {
        return rdfConnection.queryAsk(storedQuery("is_invertible_property", vocabularyGraph, createURI(predicateUri)));
    }

    public Node getVocabularyGraph() {
        return vocabularyGraph;
    }

    /**
     * Initializes the vocabulary and loads default values from file if the vocabulary is still empty
     *
     * @param rdfConnection
     * @param vocabularyGraph
     * @param filename
     * @return
     */
    public static Vocabulary initializeVocabulary(RDFConnection rdfConnection, Node vocabularyGraph, String filename) {
        commit("Initialize the vocabulary for " + vocabularyGraph.getURI(), rdfConnection, () -> {
            if(rdfConnection.fetch(vocabularyGraph.getURI()).isEmpty()) {
                log.info("Initializing vocabulary in graph {} with data from {}", vocabularyGraph.getURI(), filename);
                rdfConnection.load(vocabularyGraph.getURI(), FileManager.get().loadModel(filename));
            }
        });

        return new Vocabulary(rdfConnection, vocabularyGraph);
    }

    /**
     * Recreates the vocabulary by loading default values from file and removing existing data
     * @param rdfConnection
     * @param vocabularyGraph
     * @param filename
     * @return
     */
    public static Vocabulary recreateVocabulary(RDFConnection rdfConnection, Node vocabularyGraph, String filename) {
        commit("Recreating the vocabulary for " + vocabularyGraph.getURI(), rdfConnection, () -> {
            log.info("Recreating vocabulary in graph {} with data from {}", vocabularyGraph.getURI(), filename);
            rdfConnection.delete(vocabularyGraph.getURI());
            rdfConnection.load(vocabularyGraph.getURI(), FileManager.get().loadModel(filename));
        });

        return new Vocabulary(rdfConnection, vocabularyGraph);
    }

}
