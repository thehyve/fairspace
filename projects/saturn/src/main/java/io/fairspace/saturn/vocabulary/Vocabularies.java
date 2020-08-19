package io.fairspace.saturn.vocabulary;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.riot.RDFDataMgr.loadModel;

public class Vocabularies {
    public static final Model SYSTEM_VOCABULARY = loadModel("default-vocabularies/system-vocabulary.ttl");
    public static final Node VOCABULARY_GRAPH_URI = createURI( "https://fairspace.io/vocabulary/");

    private static final String SYSTEM_VOCABULARY_GRAPH_BACKUP = "saturn:system-vocabulary-backup";

    public static void initVocabularies(Dataset ds) {
            var oldSystemVocabulary = ds.getNamedModel(SYSTEM_VOCABULARY_GRAPH_BACKUP);

            if (!SYSTEM_VOCABULARY.isIsomorphicWith(oldSystemVocabulary)) {
                var oldVocabulary = ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI());

                var userVocabulary = oldVocabulary.isEmpty()
                        ? loadModel("default-vocabularies/user-vocabulary.ttl")
                        : oldVocabulary.difference(oldSystemVocabulary);

                ds.replaceNamedModel(VOCABULARY_GRAPH_URI.getURI(), SYSTEM_VOCABULARY.union(userVocabulary));
                ds.replaceNamedModel(SYSTEM_VOCABULARY_GRAPH_BACKUP, SYSTEM_VOCABULARY);
            }
    }
}
