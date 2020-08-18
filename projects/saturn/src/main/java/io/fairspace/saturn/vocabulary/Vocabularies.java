package io.fairspace.saturn.vocabulary;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.util.FileManager;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.rdf.SparqlUtils.generateVocabularyIri;

public class Vocabularies {
    public static final Model SYSTEM_VOCABULARY = FileManager.get().loadModel("default-vocabularies/system-vocabulary.ttl");
    public static final Node VOCABULARY_GRAPH_URI = generateVocabularyIri("");

    private static final String SYSTEM_VOCABULARY_GRAPH_BACKUP = "saturn:system-vocabulary-backup";

    public static void initVocabularies(Dataset ds) {
            var oldSystemVocabulary = ds.getNamedModel(SYSTEM_VOCABULARY_GRAPH_BACKUP);

            if (!SYSTEM_VOCABULARY.isIsomorphicWith(oldSystemVocabulary)) {
                var oldVocabulary = ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI());

                var userVocabulary = oldVocabulary.isEmpty()
                        ? FileManager.get().loadModel("default-vocabularies/user-vocabulary.ttl", CONFIG.jena.vocabularyBaseIRI, null)
                        : oldVocabulary.difference(oldSystemVocabulary);

                ds.replaceNamedModel(VOCABULARY_GRAPH_URI.getURI(), SYSTEM_VOCABULARY.union(userVocabulary));
                ds.replaceNamedModel(SYSTEM_VOCABULARY_GRAPH_BACKUP, SYSTEM_VOCABULARY);
            }
    }
}
