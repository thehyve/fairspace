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
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.text.TextDatasetFactory;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.elasticsearch.client.Client;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;

import static io.fairspace.saturn.rdf.MarkdownDataType.MARKDOWN_DATA_TYPE;
import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateRead;
import static io.fairspace.saturn.rdf.transactions.Transactions.executeWrite;
import static io.fairspace.saturn.services.permissions.PermissionsService.PERMISSIONS_GRAPH;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
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
    public static DatasetGraph connect(Config.Jena config, String projectName, Client elasticsearchClient) throws IOException {
        var dsDir = new File(config.datasetPath, projectName);
        var restoreNeeded = isRestoreNeeded(dsDir);

        // Create a TDB2 dataset graph
        var dsg = connectCreate(Location.create(dsDir.getAbsolutePath()), config.storeParams).getDatasetGraph();

        var txnLog = new LocalTransactionLog(new File(config.transactionLogPath, projectName), new SparqlTransactionCodec());

        if (elasticsearchClient != null) {
            // When a restore is needed, we instruct ES to delete the index first
            // This way, the index will be in sync with our current database
            dsg = enableElasticSearch(dsg, projectName, config, restoreNeeded, elasticsearchClient);
        }

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog);

        // Create a dataset
        var ds = DatasetFactory.wrap(dsg);

        TypeMapper.getInstance().registerDatatype(MARKDOWN_DATA_TYPE);

        if (!calculateRead(ds, () -> ds.getDefaultModel().contains(FS.theProject, null))) {
            executeWrite("Workspace initialization", ds, () -> {
                ds.getDefaultModel()
                        .add(FS.theProject, RDF.type, FS.Project)
                        .add(FS.theProject, RDFS.label, projectName)
                        .add(FS.theProject, FS.projectDescription, createTypedLiteral("", MARKDOWN_DATA_TYPE));
                ds.getNamedModel(PERMISSIONS_GRAPH).add(FS.theProject, FS.writeRestricted, createTypedLiteral(true));
            });
        }

        initVocabularies(ds);

        return dsg;
    }

    protected static boolean isRestoreNeeded(File datasetPath) {
        return !datasetPath.exists() || datasetPath.list((dir, name) -> name.startsWith("Data-")).length == 0;
    }

    private static DatasetGraph enableElasticSearch(DatasetGraph dsg, String projectName, Config.Jena config, boolean recreateIndex, Client client) throws UnknownHostException {
        try {
            // Setup ES client and index
            config.elasticSearch.settings.setIndexName(projectName);
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
            return dsg;
        }
    }
}
