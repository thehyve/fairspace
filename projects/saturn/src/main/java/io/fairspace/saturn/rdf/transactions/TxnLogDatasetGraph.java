package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.QuadAction;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Supplier;

import static java.lang.System.currentTimeMillis;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final TransactionLog transactionLog;
    private final Supplier<String> commitMessageProvider;
    private Set<Quad> added;   // Quads added in current transaction
    private Set<Quad> deleted; // Quads deleted in current transaction

    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog, Supplier<String> commitMessageProvider) {
        super(dsg);
        this.transactionLog = transactionLog;
        this.commitMessageProvider = commitMessageProvider;
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        var q = new Quad(graph, subject, predicate, object);
        switch (action) {
            case ADD:
                if (!deleted.remove(q)) {  // Check if it was previously deleted in same transaction
                    added.add(q);
                }
                break;
            case DELETE:
                if (!added.remove(q)) {    // Check if it was previously added in same transaction
                    deleted.add(q);
                }
                break;
        }
    }

    @Override
    public void begin(TxnType type) {
        begin(TxnType.convert(type));
    }


    /**
     * Start either a READ or WRITE transaction.
     **/
    @Override
    public void begin(ReadWrite readWrite) {
        super.begin(readWrite);
        if (readWrite == ReadWrite.WRITE) { // a write transaction => be ready to collect changes
            added = new HashSet<>();
            deleted = new HashSet<>();
        }
    }

    @Override
    public void commit() {
        try {
            if (isInWriteTransaction() && !(added.isEmpty() && deleted.isEmpty())) {
                logTransaction();
            }
            super.commit();
        } catch (Throwable t) {
            log.error("Error committing a transaction.", t);

            // Just in case
            System.err.println("Catastrophic failure. Error committing a transaction.");
            System.err.println("The system is probably in inconsistent state and requires recovery.");
            t.printStackTrace();
            System.err.println("Shutting down");
            System.err.flush();

            // If the system is unstable it's better to shut it down.
            System.exit(1);
        }
    }

    private void logTransaction() throws IOException {
        var transaction = new TransactionRecord();
        transaction.setAdded(added);
        transaction.setDeleted(deleted);
        transaction.setTimestamp(currentTimeMillis());
        // TODO: Set user info and commit message
        if (commitMessageProvider != null) {
            var commitMessage = commitMessageProvider.get();
            if (commitMessage != null) {
                transaction.setCommitMessage(commitMessage.replace('\n', ' ').trim());
            }
        }

        added = null;
        deleted = null;

        try {
            transactionLog.log(transaction);
        } catch (IOException e) {
            log.error("Error saving a transaction to the transaction log.", e);
            log.error("The lost transaction: \n" + transaction);

            // Just in case
            System.err.println("Error saving a transaction to the transaction log:\n");
            System.err.println(transaction);

            throw e;
        }
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
            added = null;
            deleted = null;
        }

        super.end();
    }

    private boolean isInWriteTransaction() {
        return isInTransaction() && transactionMode() == ReadWrite.WRITE;
    }
}
