package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import org.apache.jena.dboe.transaction.txn.TransactionException;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.QuadAction;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import static java.lang.System.currentTimeMillis;

public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final TransactionLog transactionLog;
    private Set<Quad> added;
    private Set<Quad> deleted;

    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog) {
        super(dsg);
        this.transactionLog = transactionLog;
    }

    @Override
    protected void change(QuadAction action, Node g, Node s, Node p, Node o) {
        Quad q = new Quad(g, s, p, o);
        switch (action) {
            case ADD:
                if (!deleted.remove(q)) {
                    added.add(q);
                }
                break;
            case DELETE:
                if(!added.remove(q)) {
                    deleted.add(q);
                }
                break;
        }
    }

    @Override
    public void begin(TxnType type) {
        begin(TxnType.convert(type));
    }

    @Override
    public void begin(ReadWrite readWrite) {
        super.begin(readWrite);
        if (readWrite == ReadWrite.WRITE) {
            added = new HashSet<>();
            deleted = new HashSet<>();
        }
    }

    @Override
    public void commit() {
        if (isInWriteTransaction() && !(added.isEmpty() && deleted.isEmpty())) {
            TransactionRecord t = new TransactionRecord();
            t.setAdded(added);
            t.setDeleted(deleted);
            t.setTimestamp(currentTimeMillis());
            // TODO: Set user info and commit message
            added = null;
            deleted = null;
            try {
                transactionLog.log(t);
            } catch (IOException e) {
                throw new TransactionException("Error writing to the transaction transactionLog", e);
            }
        }
        super.commit();
    }

    @Override
    public void abort() {
        if (isInWriteTransaction()) {
            added = null;
            deleted = null;
        }
        super.abort();
    }

    @Override
    public void end() {
        if (isInWriteTransaction()) {
            abort();
        } else {
            super.end();
        }
    }

    private boolean isInWriteTransaction() {
        return isInTransaction() && transactionMode() == ReadWrite.WRITE;
    }
}
