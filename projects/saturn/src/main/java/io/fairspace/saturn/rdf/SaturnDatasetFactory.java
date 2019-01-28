package io.fairspace.saturn.rdf;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.transactions.*;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.sparql.core.DatasetGraph;

import java.io.File;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class SaturnDatasetFactory {
    public static Dataset connect(Config config) {
        Node vocabularyGraph = createURI(config.vocabularyURI());
        TransactionLog txnLog = new LocalTransactionLog(new File(config.transactionLogPath()), SparqlTransactionSerializer.INSTANCE);
        TxnLogDatasetGraph txnLogDatasetGraph = new TxnLogDatasetGraph(connectDatasetGraph(config.datasetPath()), txnLog);
        DatasetGraph dsg = new InvertingDatasetGraph(txnLogDatasetGraph, vocabularyGraph);
        Vocabulary.init(dsg, vocabularyGraph);
        return DatasetFactory.wrap(dsg);
    }
}
