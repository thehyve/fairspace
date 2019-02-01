package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.commits.CommitMessages;
import io.fairspace.saturn.auth.SecurityUtil;
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
     * Returns a dataset to work with.
     * We're playing Russian dolls here.
     * The original TDB2 dataset graph, which in fact consists of a number of wrappers itself (Jena uses wrappers everywhere),
     * is wrapped with a number of wrapper classes, each adding a new feature.
     * Currently it only adds transaction logging and inverse properties inference and applies default vocabulary if needed.
     */
    public static Dataset connect(Config.Jena config) {
        // Create a TDB2 dataset graph
        var baseDatasetGraph = connectDatasetGraph(config.datasetPath);

        // Add transaction log
        var txnLog = new LocalTransactionLog(new File(config.transactionLogPath), new SparqlTransactionCodec());
        var txnLogDatasetGraph = new TxnLogDatasetGraph(baseDatasetGraph, txnLog, SecurityUtil::userInfo, CommitMessages::getCommitMessage);

        // Add property inversion
        var vocabularyGraphNode = createURI(config.vocabularyURI);
        var dsg = new InvertingDatasetGraph(txnLogDatasetGraph, vocabularyGraphNode);

        // Apply the vocabulary
        Vocabulary.init(dsg, vocabularyGraphNode);

        // Create a dataset
        return DatasetFactory.wrap(dsg);
    }
}
