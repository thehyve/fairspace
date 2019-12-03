package io.fairspace.saturn.rdf;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.search.*;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.dboe.base.file.Location;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.text.TextDatasetFactory;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.vocabulary.RDF;
import org.elasticsearch.client.Client;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;

import static io.fairspace.saturn.rdf.MarkdownDataType.MARKDOWN_DATA_TYPE;
import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateRead;
import static io.fairspace.saturn.rdf.transactions.Transactions.executeWrite;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.tdb2.sys.DatabaseConnection.connectCreate;

@Slf4j
public class SaturnDatasetFactory {
    /**
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it adds transaction logging, ElasticSearch indexing (if enabled) and applies default vocabulary if needed.
     */
    public static Dataset connect(Config config) throws IOException {
        var restoreNeeded = isRestoreNeeded(config.jena.datasetPath);

        // Create a TDB2 dataset graph
        var dsg = connectCreate(Location.create(config.jena.datasetPath.getAbsolutePath()), config.jena.storeParams).getDatasetGraph();

        var txnLog = new LocalTransactionLog(config.jena.transactionLogPath, new SparqlTransactionCodec());

        if (config.jena.elasticSearch.enabled) {
            // When a restore is needed, we instruct ES to delete the index first
            // This way, the index will be in sync with our current database
            dsg = enableElasticSearch(dsg, config.jena, restoreNeeded);
        }

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog);

        // Create a dataset
        var ds = DatasetFactory.wrap(dsg);

        TypeMapper.getInstance().registerDatatype(MARKDOWN_DATA_TYPE);

        if (!calculateRead(ds, () -> ds.getDefaultModel().contains(FS.theWorkspace, null))) {
            executeWrite("Workspace initialization", ds, () -> ds.getDefaultModel()
                    .add(FS.theWorkspace, RDF.type, FS.WorkspaceInstance)
                    .add(FS.theWorkspace, FS.workspaceTitle, config.workspace.name)
                    .add(FS.theWorkspace, FS.workspaceDescription, createTypedLiteral("", MARKDOWN_DATA_TYPE))
                    .add(FS.theWorkspace, FS.writeRestricted, createTypedLiteral(true)));
        }

        return ds;
    }

    protected static boolean isRestoreNeeded(File datasetPath) {
        return !datasetPath.exists() || datasetPath.list((dir, name) -> name.startsWith("Data-")).length == 0;
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
