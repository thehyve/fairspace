package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;

import java.io.IOException;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static java.lang.System.currentTimeMillis;
import static java.util.Optional.ofNullable;
import static org.apache.jena.system.Txn.calculateWrite;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph implements WriteTransactionSupport {
    private static final String ERROR_MSG =
            "Catastrophic failure. Shutting down. The system requires admin's intervention.";

    protected final TransactionLog transactionLog;


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
            critical(transactionLog::onBegin);
        }
    }

    @Override
    public void commit() {
        if (isInWriteTransaction()) {
            critical(() -> {
                transactionLog.onCommit();
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
        }

        super.abort();
    }

    private boolean isInWriteTransaction() {
        return isInTransaction() && transactionMode() == ReadWrite.WRITE;
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

    @Override
    public <T, E extends Exception> T write(ThrowingSupplier<T, E> action) throws E {
        return calculateWrite(this, () -> {
            try {
                grabTransactionMetadataFromContext();
                return action.get();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    protected void grabTransactionMetadataFromContext() throws IOException {
        var context = getThreadContext();
        var userName = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getFullName).orElse(null);
        var userId = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getSubjectClaim).orElse(null);
        transactionLog.onMetadata(context.getUserCommitMessage(), context.getSystemCommitMessage(), userId, userName, currentTimeMillis());
    }
}
