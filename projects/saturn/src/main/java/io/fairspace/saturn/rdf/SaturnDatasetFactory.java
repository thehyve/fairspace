package io.fairspace.saturn.rdf;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.search.IndexDispatcher;
import io.fairspace.saturn.rdf.search.IndexedDatasetGraph;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.dboe.base.file.Location;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.system.Txn;

import java.io.File;

import static io.fairspace.saturn.rdf.MarkdownDataType.MARKDOWN_DATA_TYPE;
import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
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
    public static Dataset connect(Config config) {
        var restoreNeeded = isRestoreNeeded(config.jena.datasetPath);

        // Create a TDB2 dataset graph
        var dsg = connectCreate(Location.create(config.jena.datasetPath.getAbsolutePath()), config.jena.storeParams).getDatasetGraph();

        var txnLog = new LocalTransactionLog(config.jena.transactionLogPath, new SparqlTransactionCodec());

        if (config.jena.elasticSearch.enabled) {
            try {
                dsg = new IndexedDatasetGraph(dsg, config.jena.elasticSearch.settings, config.jena.elasticSearch.advancedSettings, new IndexDispatcher(config.publicUrl + "/api/v1/webdav/"), restoreNeeded);
            } catch (Exception e) {
                log.error("Error connecting to ElasticSearch", e);
                if (config.jena.elasticSearch.required) {
                    throw e; // Terminates Saturn
                }
            }
        }

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog);

        var ds = DatasetFactory.wrap(dsg);

        Txn.executeWrite(ds, () -> {
            TypeMapper.getInstance().registerDatatype(MARKDOWN_DATA_TYPE);

            initVocabularies(ds);
        });

        return ds;
    }

    protected static boolean isRestoreNeeded(File datasetPath) {
        return !datasetPath.exists() || datasetPath.list((dir, name) -> name.startsWith("Data-")).length == 0;
    }
}
