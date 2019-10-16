package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.Context;
import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;

import java.util.function.Supplier;

import static java.lang.System.currentTimeMillis;
import static java.util.Optional.ofNullable;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private static final String ERROR_MSG =
            "Catastrophic failure. Shutting down. The system requires admin's intervention.";

    private final TransactionLog transactionLog;
    private final Supplier<Context> contextSupplier;



    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog, Supplier<Context> contextSupplier) {
        super(dsg);
        this.transactionLog = transactionLog;
        this.contextSupplier = contextSupplier;
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
            var ctx = ofNullable(contextSupplier.get());
            var userName = ctx.map(Context::getUserInfo).map(OAuthAuthenticationToken::getFullName).orElse(null);
            var userId = ctx.map(Context::getUserInfo).map(OAuthAuthenticationToken::getSubjectClaim).orElse(null);
            var commitMessage = ctx.map(Context::getCommitMessage).orElse(null);

            critical(() ->
                    transactionLog.onBegin(commitMessage, userId, userName, currentTimeMillis()));
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
}
