package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.dboe.transaction.TransactionalMonitor;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetChanges;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.QuadAction;
import org.apache.jena.tdb2.store.DatasetGraphTDB;

import java.io.IOException;


public class LoggingTransactionalMonitor implements TransactionalMonitor, DatasetChanges {
    private final DatasetGraphTDB datasetGraph;
    private final TransactionLog transactionLog;
    private TransactionRecord transaction; // Thread-safe, guarded by the transaction system

    public static void attach(DatasetGraphTDB datasetGraph, TransactionLog transactionLog) {
        LoggingTransactionalMonitor monitor = new LoggingTransactionalMonitor(datasetGraph, transactionLog);
        datasetGraph.setTransactionalMonitor(monitor);
        datasetGraph.setMonitor(monitor);
    }

    private LoggingTransactionalMonitor(DatasetGraphTDB datasetGraph, TransactionLog transactionLog) {
        this.datasetGraph = datasetGraph;
        this.transactionLog = transactionLog;
    }

    @Override
    public void startBegin(TxnType txnType) {
        if (isWriting()) {
            transaction = new TransactionRecord();
            transaction.setStartTimestamp( System.currentTimeMillis());
        }
    }

    @Override
    public void startCommit() {
        if (isWriting()) {
            TransactionRecord t = this.transaction;
            this.transaction = null;
            t.setCommitTimestamp(System.currentTimeMillis());
            try {
                transactionLog.log(t);
            } catch (IOException e) {
                throw new RuntimeException("Error logging a transaction", e);
            }
        }
    }

    @Override
    public void startAbort() {
        this.transaction = null;
    }

    @Override
    public void change(QuadAction action, Node g, Node s, Node p, Node o) {
        switch (action) {
            case ADD:
                if (!datasetGraph.contains(g, s, p, o)) {
                    transaction.getAdded().add(new Quad(g, s, p, o));
                }
                break;
            case DELETE:
                if (datasetGraph.contains(g, s, p, o)) {
                    transaction.getDeleted().add(new Quad(g, s, p, o));
                }
                break;
        }
    }

    @Override
    public void start() {
    }

    @Override
    public void finish() {
    }

    @Override
    public void reset() {
    }

    private boolean isWriting() {
        return datasetGraph.getTxnSystem().getThreadTransaction().getMode() == ReadWrite.WRITE;
    }
}
