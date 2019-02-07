package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.commits.CommitMessages;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.search.AutoEntityDefinition;
import io.fairspace.saturn.rdf.search.SmartTextDocProducer;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.text.TextDatasetFactory;
import org.apache.jena.query.text.TextIndexConfig;

import java.io.File;

import static io.fairspace.saturn.rdf.Vocabulary.initVocabulary;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.text.es.TextESDatasetFactory.createESIndex;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class SaturnDatasetFactory {
    /**
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it adds transaction logging, ElasticSearch indexing (if enabled),
     * inverse properties' inference, and applies default vocabulary if needed.
     */
    public static Dataset connect(Config.Jena config) {
        // Create a TDB2 dataset graph
        var dsg = connectDatasetGraph(config.datasetPath);

        // Add transaction log
        var txnLog = new LocalTransactionLog(new File(config.transactionLogPath), new SparqlTransactionCodec());
        dsg = new TxnLogDatasetGraph(dsg, txnLog, SecurityUtil::userInfo, CommitMessages::getCommitMessage);

        // ElasticSearch
        if (config.elasticSearch.enabled) {
            var textIndex = createESIndex(new TextIndexConfig(new AutoEntityDefinition()), config.elasticSearch.settings);
            dsg = TextDatasetFactory.create(dsg, textIndex, true, new SmartTextDocProducer(textIndex));
        }

        // Add property inversion
        var vocabularyGraphNode = createURI(config.baseURI + "vocabulary");
        var dsg = new InvertingDatasetGraph(txnLogDatasetGraph, vocabularyGraphNode);

        // Apply the vocabulary
        initVocabulary(dsg, vocabularyGraphNode);

        // Create a dataset
        return DatasetFactory.wrap(dsg);
    }
}
