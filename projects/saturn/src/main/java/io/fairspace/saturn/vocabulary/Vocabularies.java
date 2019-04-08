package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.util.FileManager;

import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.generateIri;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.calculateRead;

public class Vocabularies {
    public static final String SYSTEM_VOCABULARY_GRAPH_URI = FS.NS + "system-vocabulary";
    public static final String META_VOCABULARY_GRAPH_URI = FS.NS + "meta-vocabulary";

    private static final Model systemModel = FileManager.get().loadModel("default-vocabularies/system-vocabulary.ttl");
    private static final Model metaModel = FileManager.get().loadModel("default-vocabularies/meta-vocabulary.ttl");

    private final RDFConnection rdf;
    private final String userVocabularyGraphUri;

    public Vocabularies(RDFConnection rdf) {
        this.rdf = rdf;
        this.userVocabularyGraphUri = generateIri("user-vocabulary").getURI();

        commit("Initializing the vocabularies", rdf, () -> {
            updateVocabulary(SYSTEM_VOCABULARY_GRAPH_URI, systemModel);
            updateVocabulary(META_VOCABULARY_GRAPH_URI, metaModel);

            if (rdf.fetch(userVocabularyGraphUri).isEmpty()) {
                rdf.load(userVocabularyGraphUri, FileManager.get().loadModel("default-vocabularies/user-vocabulary.ttl"));
            }
        });
    }

    private void updateVocabulary(String uri, Model model) {
        if (!model.isIsomorphicWith(rdf.fetch(uri))) {
            rdf.delete(uri);
            rdf.load(uri, model);
        }
    }

    public Model getCombinedVocabulary() {
        return calculateRead(rdf, () ->
                rdf.fetch(SYSTEM_VOCABULARY_GRAPH_URI)
                        .add(rdf.fetch(userVocabularyGraphUri)));
    }

    public List<String> getMachineOnlyPredicates(String vocabularyGraphUri) {
        var processor = new QuerySolutionProcessor<>(row -> row.getResource("property").getURI());
        rdf.querySelect(storedQuery("machine_only_properties", createURI(vocabularyGraphUri)), processor);
        return processor.getValues();
    }

}
