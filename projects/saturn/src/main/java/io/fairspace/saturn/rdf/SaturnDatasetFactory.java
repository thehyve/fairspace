package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.commits.CommitMessages;
import io.fairspace.saturn.rdf.search.*;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.text.TextDatasetFactory;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.sparql.core.DatasetGraph;
import org.elasticsearch.client.Client;

import java.io.IOException;
import java.net.UnknownHostException;

import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

@Slf4j
public class SaturnDatasetFactory {
    /**
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it adds transaction logging, ElasticSearch indexing (if enabled) and applies default vocabulary if needed.
     */
    public static Dataset connect(Config.Jena config) throws IOException {
        var restoreNeeded = !config.datasetPath.exists();

        // Create a TDB2 dataset graph
        var dsg = connectDatasetGraph(config.datasetPath.getAbsolutePath());

        var txnLog = new LocalTransactionLog(config.transactionLogPath, new SparqlTransactionCodec());

        if (config.elasticSearch.enabled) {
            dsg = enableElasticSearch(dsg, config, restoreNeeded);
        }

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog, SecurityUtil::userInfo, CommitMessages::getCommitMessage);

        // Create a dataset
        return DatasetFactory.wrap(dsg);
    }

    private static DatasetGraph enableElasticSearch(DatasetGraph dsg, Config.Jena config, boolean recreateIndex) throws UnknownHostException {
        Client client = null;
        try {
            // Setup ES client and index
            client = ElasticSearchClientFactory.build(config.elasticSearch.settings, config.elasticSearch.advancedSettings);
            ElasticSearchIndexConfigurer.configure(client, config.elasticSearch.settings, recreateIndex);

            // Create a dataset graph that updates ES with every triple update
            var textIndex = new TextIndexESBulk(new TextIndexConfig(new AutoEntityDefinition()), client, config.elasticSearch.settings.getIndexName());
            var textDocProducer = new SingleTripleTextDocProducer(textIndex, !config.elasticSearch.required);
            return TextDatasetFactory.create(dsg, textIndex, true, textDocProducer);
        } catch (Exception e) {
            log.error("Error connecting to ElasticSearch", e);
            if (config.elasticSearch.required) {
                throw e; // Terminates Saturn
            }
            if (client != null) {
                client.close();
            }
            return dsg;
        }
    }
}
