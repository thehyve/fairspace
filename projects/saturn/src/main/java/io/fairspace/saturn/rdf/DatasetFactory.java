package io.fairspace.saturn.rdf;

import io.fairspace.saturn.App;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.LoggingTransactionalMonitor;
import io.fairspace.saturn.rdf.transactions.SimpleTransactionSerializer;
import io.fairspace.saturn.rdf.transactions.TransactionLog;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetGraphWrapper;
import org.apache.jena.tdb2.TDB2Factory;
import org.apache.jena.tdb2.store.DatasetGraphTDB;

import java.io.File;

public class DatasetFactory {
    public static Dataset connectDataset() {
        Dataset storedDataset = TDB2Factory.connectDataset(App.CONFIG.datasetPath());
        DatasetGraphTDB dsg = (DatasetGraphTDB) ((DatasetGraphWrapper) storedDataset.asDatasetGraph()).getWrapped();
        TransactionLog transactionLog = new LocalTransactionLog(
                new File(App.CONFIG.transactionLogPath()), new SimpleTransactionSerializer());
        LoggingTransactionalMonitor.attach(dsg, transactionLog);
        return storedDataset;
    }
}
