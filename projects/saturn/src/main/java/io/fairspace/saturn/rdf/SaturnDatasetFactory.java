package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SparqlTransactionSerializer;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;

import java.io.File;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class SaturnDatasetFactory {
    public static Dataset connect(Config config) {
        var vocabularyGraph = createURI(config.vocabularyURI());
        var txnLog = new LocalTransactionLog(new File(config.transactionLogPath()), SparqlTransactionSerializer.INSTANCE);
        var txnLogDatasetGraph = new TxnLogDatasetGraph(connectDatasetGraph(config.datasetPath()), txnLog);
        var dsg = new InvertingDatasetGraph(txnLogDatasetGraph, vocabularyGraph);
        Vocabulary.init(dsg, vocabularyGraph);
        return DatasetFactory.wrap(dsg);
    }
}
