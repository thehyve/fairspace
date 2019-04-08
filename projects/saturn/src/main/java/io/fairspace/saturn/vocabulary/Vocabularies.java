package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.util.FileManager;
import org.elasticsearch.common.recycler.Recycler;

import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.generateIri;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.calculateRead;

public class Vocabularies {
    public static final String META_VOCABULARY_GRAPH_URI = FS.NS + "meta-vocabulary";
    public static final String VOCABULARY_GRAPH_URI = generateIri("vocabulary").getURI();

    private final RDFConnection rdf;

    public Vocabularies(RDFConnection rdf) {
        this.rdf = rdf;

        commit("Initializing the vocabularies", rdf, () -> {
            initVocabulary(META_VOCABULARY_GRAPH_URI, "meta-vocabulary.ttl");
            initVocabulary(VOCABULARY_GRAPH_URI, "system-vocabulary.ttl", "user-vocabulary.ttl");
        });
    }

    private void initVocabulary(String graphUri, String... files) {
        if (rdf.fetch(graphUri).isEmpty()) {
            for (var file: files) {
                var model = FileManager.get().loadModel("default-vocabularies/" + file, graphUri + '#', null);
                rdf.load(graphUri, model);
            }
        }
    }

    public List<String> getMachineOnlyPredicates(String vocabularyGraphUri) {
        var processor = new QuerySolutionProcessor<>(row -> row.getResource("property").getURI());
        rdf.querySelect(storedQuery("machine_only_properties", createURI(vocabularyGraphUri)), processor);
        return processor.getValues();
    }

}
