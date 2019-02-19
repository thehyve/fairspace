package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;

import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.transactions.Panic.panic;
import static java.lang.System.currentTimeMillis;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final TransactionLog transactionLog;
    private final Supplier<UserInfo> userInfoProvider;
    private final Supplier<String> commitMessageProvider;


    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog, Supplier<UserInfo> userInfoProvider, Supplier<String> commitMessageProvider) {
        super(dsg);
        this.transactionLog = transactionLog;
        this.userInfoProvider = userInfoProvider;
        this.commitMessageProvider = commitMessageProvider;
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        switch (action) {
            case ADD:
                transactionLog.onAdd(graph, subject, predicate, object);
                break;
            case DELETE:
                transactionLog.onDelete(graph, subject, predicate, object);
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
            String userName = null;
            String userId = null;
            if (userInfoProvider != null) {
                var userInfo = userInfoProvider.get();
                if (userInfo != null) {
                    userId = userInfo.getUserId();
                    userName = userInfo.getFullName();
                }
            }
            String commitMessage = null;

            if (commitMessageProvider != null) {
                commitMessage = commitMessageProvider.get();
            }
            transactionLog.onBegin(commitMessage, userId, userName, currentTimeMillis());
        }
    }

    @Override
    public void commit() {
        if (isInWriteTransaction()) {
            var persisted = false;
            try {
                transactionLog.onCommit();
                persisted = true;
                super.commit();
            } catch (Throwable throwable) {
                panic(throwable, persisted);
            }
        } else {
            super.commit();
        }
    }

    @Override
    public void abort() {
        if (isInWriteTransaction()) {
            transactionLog.onAbort();
        }

        super.abort();
    }

    private boolean isInWriteTransaction() {
        return isInTransaction() && transactionMode() == ReadWrite.WRITE;
    }
}
