package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import io.fairspace.saturn.ThreadContext;
import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import io.fairspace.saturn.services.users.User;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;

import java.io.IOException;

import static io.fairspace.saturn.ThreadContext.setThreadContextListener;
import static io.fairspace.saturn.rdf.SparqlUtils.extractIdFromIri;
import static java.lang.System.currentTimeMillis;
import static java.util.Optional.ofNullable;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private static final String ERROR_MSG =
            "Catastrophic failure. Shutting down. The system requires admin's intervention.";

    private final TransactionLog transactionLog;


    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog) {
        super(dsg);
        this.transactionLog = transactionLog;
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        critical(() -> {
            switch (action) {
                case ADD:
                    transactionLog.onAdd(graph, subject, predicate, object);
                    break;
                case DELETE:
                    transactionLog.onDelete(graph, subject, predicate, object);
                    break;
            }
        });
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
            critical(() -> {
                transactionLog.onBegin();
                setThreadContextListener(this::onThreadContextChanged);
            });
        }
    }

    @Override
    public void commit() {
        if (isInWriteTransaction()) {
            critical(() -> {
                transactionLog.onCommit();
                setThreadContextListener(null);
                super.commit();
            });
        } else {
            super.commit();
        }
    }

    @Override
    public void abort() {
        if (isInWriteTransaction()) {
            critical(transactionLog::onAbort);
            setThreadContextListener(null);
        }

        super.abort();
    }

    private boolean isInWriteTransaction() {
        return transactionMode() == ReadWrite.WRITE;
    }

    private void critical(ThrowingRunnable<Exception> action) {
        try {
            action.run();
        } catch (Throwable t) {
            log.error(ERROR_MSG, t);


            // SLF4J has no flush method.
            System.err.println(ERROR_MSG);
            t.printStackTrace();

            System.err.flush();

            log.error(ERROR_MSG, t);
            // There's no log.flush() :-(

            System.exit(1);
        }
    }

    private void onThreadContextChanged(ThreadContext context) {
        if (isInWriteTransaction()) {
            var userName = ofNullable(context.getUser()).map(User::getName).orElse(null);
            var userId = ofNullable(context.getUser()).map(user -> extractIdFromIri(user.getIri())).orElse(null);
            try {
                transactionLog.onMetadata(context.getUserCommitMessage(), context.getSystemCommitMessage(), userId, userName, currentTimeMillis());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
