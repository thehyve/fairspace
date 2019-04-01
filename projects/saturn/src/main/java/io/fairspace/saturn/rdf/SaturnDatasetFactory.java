package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.commits.CommitMessages;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.search.AutoEntityDefinition;
import io.fairspace.saturn.rdf.search.ElasticSearchClientFactory;
import io.fairspace.saturn.rdf.search.ElasticSearchIndexConfigurer;
import io.fairspace.saturn.rdf.search.SingleTripleTextDocProducer;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.text.TextDatasetFactory;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.query.text.es.TextIndexES;
import org.elasticsearch.client.Client;

import java.io.IOException;

import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

@Slf4j
public class SaturnDatasetFactory {
    /**
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it adds transaction logging, ElasticSearch indexing (if enabled),
     * inverse properties' inference, and applies default vocabulary if needed.
     */
    public static Dataset connect(Config.Jena config, Node inferenceGraphNode) throws IOException {
        var restoreNeeded = !config.datasetPath.exists();

        // Create a TDB2 dataset graph
        var dsg = connectDatasetGraph(config.datasetPath.getAbsolutePath());

        var txnLog = new LocalTransactionLog(config.transactionLogPath, new SparqlTransactionCodec());

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog, SecurityUtil::userInfo, CommitMessages::getCommitMessage);

        // ElasticSearch
        if (config.elasticSearch.enabled) {
            try {
                // Setup ES client and index
                Client client = ElasticSearchClientFactory.build(config.elasticSearch.settings);
                ElasticSearchIndexConfigurer esConfigurer = new ElasticSearchIndexConfigurer(client);
                esConfigurer.configure(config.elasticSearch.settings);

                // Create a dataset that updates ES with every triple update
                var textIndex =  new TextIndexES(new TextIndexConfig(new AutoEntityDefinition()), client, config.elasticSearch.settings.getIndexName());
                var textDocProducer = new SingleTripleTextDocProducer(textIndex, !config.elasticSearch.required);
                dsg = TextDatasetFactory.create(dsg, textIndex, true, textDocProducer);
            } catch (Exception e) {
                log.error("Error connecting to ElasticSearch", e);
                if (config.elasticSearch.required) {
                    throw e; // Terminates Saturn
                }
            }
        }

        // Add property inversion
        dsg = new InvertingDatasetGraph(dsg, inferenceGraphNode);

        // Create a dataset
        return DatasetFactory.wrap(dsg);
    }
}
