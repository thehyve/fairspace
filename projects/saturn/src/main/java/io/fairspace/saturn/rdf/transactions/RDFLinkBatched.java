package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingFunction;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.ThreadContext;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.SparqlQueryConnection;
import org.apache.jena.system.Txn;

import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import static com.pivovarit.function.ThrowingFunction.sneaky;
import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.rdf.transactions.Critical.critical;
import static java.lang.System.currentTimeMillis;
import static java.lang.Thread.currentThread;
import static java.util.Optional.ofNullable;

public class RDFLinkBatched implements RDFLink {
    private final LinkedBlockingQueue<PartialTask<?, ?>> queue = new LinkedBlockingQueue<>();

    private final RDFConnection rdf;
    private final TransactionLog txnLog;
    private final Thread worker;

    public RDFLinkBatched(RDFConnection rdf, TransactionLog txnLog) {
        this.rdf = rdf;
        this.txnLog = txnLog;
        worker = new Thread(() -> {
            while (true) {
                var tasks = new ArrayList<PartialTask<?, ?>>();
                try {
                    tasks.add(queue.take());
                } catch (InterruptedException e) {
                    return;
                }
                queue.drainTo(tasks);
                Txn.executeWrite(rdf, () -> tasks.forEach(task -> task.apply(rdf, txnLog)));
                tasks.forEach(PartialTask::batchCompleted);
            }
        });
        worker.start();
    }

    @Override
    public <R, E extends Exception> R calculateRead(ThrowingFunction<? super SparqlQueryConnection, ? extends R, ? extends E> job) throws E {
        return Txn.calculateRead(rdf, () -> sneaky(job).apply(rdf));
    }

    @Override
    public <R, E extends Exception> R calculateWrite(String message, ThrowingFunction<? super RDFConnection, ? extends R, ? extends E> job) throws E {
        if (currentThread() == worker) {
            return job.apply(rdf);
        }

        var ctx = getThreadContext();
        if (message != null) {
            ctx.setSystemCommitMessage(message);
        }

        var task = new PartialTask<>(ctx, job);
        queue.offer(task);

        return task.get();
    }

    private static class PartialTask<R, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final ThreadContext context;
        private final ThrowingFunction<? super RDFConnection, R, E> job;
        private R result;
        private Exception error;

        PartialTask(ThreadContext context, ThrowingFunction<? super RDFConnection, R, E> job) {
            this.context = context;
            this.job = job;
        }

        void apply(RDFConnection rdf, TransactionLog txnLog) {
            try {
                setThreadContext(context);
                var userName = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getFullName).orElse(null);
                var userId = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getSubjectClaim).orElse(null);
                critical(() -> txnLog.onBegin(context.getUserCommitMessage(), context.getSystemCommitMessage(), userId, userName, currentTimeMillis()));

                result = job.apply(rdf);

                critical(txnLog::onCommit);
            } catch (Exception e) {
                critical(txnLog::onAbort);
                error = e;
                canBeRead.countDown(); // No need to wait until the transaction is committed
            }
        }

        void batchCompleted() {
            canBeRead.countDown();
        }

        R get() throws E {
            try {
                canBeRead.await();
            } catch (InterruptedException e) {
                currentThread().interrupt();
                throw new RuntimeException(e);
            }

            if (error == null) {
                return result;
            }

            if (error instanceof RuntimeException) {
                throw (RuntimeException) error;
            }

            throw (E) error;
        }
    }
}
