package io.fairspace.saturn.vocabulary;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.util.FileManager;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.rdf.SparqlUtils.generateVocabularyIri;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.vocabulary.Inference.applyInference;
import static org.apache.jena.graph.NodeFactory.createURI;

public class Vocabularies {
    public static final Model META_VOCABULARY = FileManager.get().loadModel("default-vocabularies/meta-vocabulary.ttl");
    public static final Model SYSTEM_VOCABULARY = applyInference(META_VOCABULARY, FileManager.get().loadModel("default-vocabularies/system-vocabulary.ttl"));
    public static final Node META_VOCABULARY_GRAPH_URI = createURI(FS.NS + "meta-vocabulary");
    public static final Node VOCABULARY_GRAPH_URI = generateVocabularyIri("");

    private static final String SYSTEM_VOCABULARY_GRAPH_BACKUP = "saturn:system-vocabulary-backup";

    public static void initVocabularies(RDFConnection rdf) {
        commit("Initializing the vocabularies", () -> {
            rdf.put(META_VOCABULARY_GRAPH_URI.getURI(), META_VOCABULARY);

            var oldSystemVocabulary = rdf.fetch(SYSTEM_VOCABULARY_GRAPH_BACKUP);

            if (!SYSTEM_VOCABULARY.isIsomorphicWith(oldSystemVocabulary)) {
                var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());

                var userVocabulary = oldVocabulary.isEmpty()
                        ? FileManager.get().loadModel("default-vocabularies/user-vocabulary.ttl", CONFIG.jena.vocabularyBaseIRI, null)
                        : oldVocabulary.difference(oldSystemVocabulary);

                applyInference(META_VOCABULARY, userVocabulary);

                rdf.put(VOCABULARY_GRAPH_URI.getURI(), SYSTEM_VOCABULARY.union(userVocabulary));
                rdf.put(SYSTEM_VOCABULARY_GRAPH_BACKUP, SYSTEM_VOCABULARY);
            }
        });
    }
}
