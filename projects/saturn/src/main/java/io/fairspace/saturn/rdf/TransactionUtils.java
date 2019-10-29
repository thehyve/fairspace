package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.ThreadContext;
import io.fairspace.saturn.rdf.transactions.TransactionLog;
import org.apache.jena.sparql.core.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.System.currentTimeMillis;
import static java.lang.Thread.currentThread;
import static java.util.Optional.ofNullable;
import static org.apache.jena.system.Txn.calculateWrite;

// TODO: Make me a service
public class TransactionUtils {
    private static Transactional transactional;
    private static TransactionLog txnLog;
    private static final LinkedBlockingQueue<Task<?, ?>> queue = new LinkedBlockingQueue<>();
    private static final Thread worker = new Thread(() -> {
        while (true) {
            var tasks = new ArrayList<Task<?, ?>>();
            try {
                tasks.add(queue.take());
            } catch (InterruptedException e) {
                return;
            }
            queue.drainTo(tasks);

            while (!tryExecute(tasks));

            tasks.forEach(Task::batchCompleted);  // mark all tasks as committed
        }

    }, "Batch transaction processor");

    private static boolean tryExecute(Collection<Task<?, ?>> tasks) {
        return tasks.isEmpty() || calculateWrite(transactional, () -> {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                try {
                    task.apply();
                } catch (Exception e) {
                    // abort the transaction, exclude the failed task and retry
                    transactional.abort();
                    it.remove();
                    return false;
                }
            }
            return true; // success
        });
    }


    public static void init(Transactional transactional, TransactionLog txLog) {
        TransactionUtils.transactional = transactional;
        TransactionUtils.txnLog = txLog;

        if (!worker.isAlive()) {
            worker.start();
        }
    }

    public static <T, E extends Exception> T commit(String message, ThrowingSupplier<T, E> action) throws E {
        var ctx = getThreadContext();
        if (ctx.getSystemCommitMessage() != null) {
            ctx.setSystemCommitMessage(message);
        }

        if (currentThread() == worker) {
            return action.get();
        }

        var task = new Task<>(ctx, action);
        queue.offer(task);
        return task.get();
    }

    public static <E extends Exception> void commit(String message, ThrowingRunnable<E> action) throws E {
        commit(message, () -> {
            action.run();
            return null;
        });
    }

    private static class Task<R, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final ThreadContext context;
        private final ThrowingSupplier<R, E> action;
        private R result;
        private Exception error;

        Task(ThreadContext context, ThrowingSupplier<R, E> action) {
            this.context = context;
            this.action = action;
        }

        void apply() throws Exception {
            try {
                var userName = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getFullName).orElse(null);
                var userId = ofNullable(context.getUserInfo()).map(OAuthAuthenticationToken::getSubjectClaim).orElse(null);
                txnLog.onMetadata(context.getUserCommitMessage(), context.getSystemCommitMessage(), userId, userName, currentTimeMillis());

                setThreadContext(context);
                result = action.get();
            } catch (Exception e) {
                error = e;
                canBeRead.countDown(); // No need to wait until the transaction is committed
                throw e;
            } finally {
                cleanThreadContext();
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
