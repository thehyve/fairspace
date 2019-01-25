package io.fairspace.saturn.rdf;

import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SimpleTransactionSerializer;
import io.fairspace.saturn.rdf.transactions.TransactionLog;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.sparql.core.DatasetGraph;

import java.io.File;

import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class SaturnDatasetFactory {
    public static Dataset connect(String datasetPath, String transactionLogPath) {
        TransactionLog txnLog = new LocalTransactionLog(new File(transactionLogPath), new SimpleTransactionSerializer());
        DatasetGraph dsg = new InvertingDatasetGraph(new TxnLogDatasetGraph(connectDatasetGraph(datasetPath), txnLog));
        Vocabulary.init(dsg);
        return DatasetFactory.wrap(dsg);
    }
}
