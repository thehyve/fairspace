package io.fairspace.saturn.rdf;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.rdf.search.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.views.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.dboe.base.file.Location;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;

import java.io.File;

import static io.fairspace.saturn.rdf.MarkdownDataType.MARKDOWN_DATA_TYPE;
import static io.fairspace.saturn.rdf.transactions.Restore.restore;
import static org.apache.jena.tdb2.sys.DatabaseConnection.connectCreate;

@Slf4j
public class SaturnDatasetFactory {
    /**
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it adds transaction logging, indexing (if enabled) and applies default vocabulary if needed.
     */
    public static Dataset connect(Config.Jena config, boolean enableEs, ViewStoreClient viewStoreClient) {
        var restoreNeeded = isRestoreNeeded(config.datasetPath);

        // Create a TDB2 dataset graph
        var dsg = connectCreate(Location.create(config.datasetPath.getAbsolutePath()), config.storeParams).getDatasetGraph();

        var txnLog = new LocalTransactionLog(config.transactionLogPath, new SparqlTransactionCodec());

        if (enableEs) {
            try {
                dsg = new IndexedDatasetGraph(dsg, config.elasticSearch.settings, config.elasticSearch.advancedSettings, new IndexDispatcher(dsg.getContext()), restoreNeeded);
            } catch (Exception e) {
                log.error("Error connecting to ElasticSearch", e);
                throw e; // Terminates Saturn
            }
        }
        if (viewStoreClient != null) {
            dsg = new TxnIndexDatasetGraph(dsg, viewStoreClient);
        }

        if (restoreNeeded) {
            restore(dsg, txnLog);
        }

        // Add transaction log
        dsg = new TxnLogDatasetGraph(dsg, txnLog);

        TypeMapper.getInstance().registerDatatype(MARKDOWN_DATA_TYPE);

        return DatasetFactory.wrap(dsg);
    }

    protected static boolean isRestoreNeeded(File datasetPath) {
        return !datasetPath.exists() || datasetPath.list((dir, name) -> name.startsWith("Data-")).length == 0;
    }
}
