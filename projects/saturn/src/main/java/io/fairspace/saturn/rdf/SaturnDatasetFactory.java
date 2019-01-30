package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionCodec;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;

import java.io.File;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class SaturnDatasetFactory {
    /**
     * Returns a dataset.
     * The original TDB2 dataset graph is wrapped with a number of wrapper classes, each adding a new feature
     */
    public static Dataset connect(Config config) {
        // Create a TDB2 dataset graph
        var baseDatasetGraph = connectDatasetGraph(config.datasetPath());

        // Add transaction log
        var txnLog = new LocalTransactionLog(new File(config.transactionLogPath()), new SparqlTransactionCodec());
        var txnLogDatasetGraph = new TxnLogDatasetGraph(baseDatasetGraph, txnLog);

        // Add property inversion
        var vocabularyGraph = createURI(config.vocabularyURI());
        var dsg = new InvertingDatasetGraph(txnLogDatasetGraph, vocabularyGraph);

        // Apply the vocabulary
        Vocabulary.init(dsg, vocabularyGraph);

        // Create a dataset
        return DatasetFactory.wrap(dsg);
    }
}
