package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.ThreadContext;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.sparql.JenaTransactionException;
import org.apache.jena.sparql.core.Transactional;
import org.apache.jena.system.Txn;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.Thread.currentThread;

public class Transactions {
    private static final LinkedBlockingQueue<Task<?, ?>> queue = new LinkedBlockingQueue<>();

    static {
        new Thread(() -> {
            while (true) {
                var tasks = new ArrayList<Task<?, ?>>();
                try {
                    tasks.add(queue.take());
                } catch (InterruptedException e) {
                    return;
                }
                queue.drainTo(tasks);

                while (!tryExecute(tasks)) ;

                tasks.forEach(Task::completed);  // mark all tasks as committed
            }
        }, "Batch transaction processor")
                .start();
    }


    public static <E extends Exception> void executeWrite(Transactional txn, ThrowingRunnable<E> r) throws E {
        calculateWrite(txn, () -> {
            r.run();
            return null;
        });
    }

    public static <X, E extends Exception> X calculateWrite(Transactional txn, ThrowingSupplier<X, E> r) throws E {
        try {
            if (txn.isInTransaction()) {
                if (txn.transactionMode() == ReadWrite.WRITE) {
                    return r.get();
                }
                throw new JenaTransactionException("Can't promote to a write transaction");
            }

            var task = new Task<>(getThreadContext(), txn, r);

            queue.offer(task);
            return task.get();
        } catch (Throwable t) {
            return sneakyThrow(t);
        }
    }

    public static <T, E extends Exception> T calculateWrite(String systemCommitMessage, Transactional txn, ThrowingSupplier<T, E> action) throws E {
        withSystemCommitMessage(systemCommitMessage);
        return calculateWrite(txn, action);
    }

    public static <E extends Exception> void executeWrite(String systemCommitMessage, Transactional txn, ThrowingRunnable<E> action) throws E {
        withSystemCommitMessage(systemCommitMessage);
        executeWrite(txn, action);
    }

    public static <E extends Exception> void executeRead(Transactional txn, ThrowingRunnable<E> r) throws E {
        Txn.executeRead(txn, ThrowingRunnable.sneaky(r));
    }

    public static <X, E extends Exception> X calculateRead(Transactional txn, ThrowingSupplier<X, E> r) throws E {
        return Txn.calculateRead(txn, ThrowingSupplier.sneaky(r));
    }

    private static void withSystemCommitMessage(String systemCommitMessage) {
        var ctx = getThreadContext();
        if (ctx != null) {
            ctx.setSystemCommitMessage(systemCommitMessage);
        }
    }

    private static boolean tryExecute(List<Task<?, ?>> tasks) {
        if (tasks.isEmpty()) {
            return true;
        }
        var txn = tasks.get(0).txn; // we assume that all tasks share same transactional
        return Txn.calculateWrite(txn, () -> {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                if (!task.perform()) {
                    txn.abort();
                    it.remove();
                    task.completed(); // task failed, no need to wait for other tasks
                    return false;
                }
            }
            return true;
        });
    }

    private static <T extends Throwable, R> R sneakyThrow(Throwable t) throws T {
        throw (T) t;
    }

    private static class Task<R, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final ThreadContext context;
        private final Transactional txn;
        private final ThrowingSupplier<R, E> action;
        private R result;
        private Throwable error;

        Task(ThreadContext context, Transactional txn, ThrowingSupplier<R, E> action) {
            this.context = context;
            this.txn = txn;
            this.action = action;
        }

        boolean perform() {
            try {
                setThreadContext(context);

                result = action.get();
                error = null;
                return true;
            } catch (Exception e) {
                result = null;
                error = e;
                return false;
            } finally {
                cleanThreadContext();
            }
        }

        // Either committed or failed
        void completed() {
            canBeRead.countDown();
        }

        R get() throws Throwable {
            try {
                canBeRead.await();
            } catch (InterruptedException e) {
                currentThread().interrupt();
                throw new RuntimeException(e);
            }

            if (error == null) {
                return result;
            }

            throw error;
        }
    }
}
