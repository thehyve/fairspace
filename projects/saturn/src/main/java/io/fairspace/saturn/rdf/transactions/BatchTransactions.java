package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.ThreadContext;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.dynamic.ClassFileLocator;
import net.bytebuddy.dynamic.loading.ClassLoadingStrategy;
import net.bytebuddy.pool.TypePool;
import org.apache.jena.query.TxnType;
import org.apache.jena.sparql.core.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Supplier;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.Thread.currentThread;
import static net.bytebuddy.implementation.MethodDelegation.to;
import static net.bytebuddy.matcher.ElementMatchers.named;

public class BatchTransactions {
    private static final LinkedBlockingQueue<Task<?>> queue = new LinkedBlockingQueue<>();
    private static final Thread worker = new Thread(() -> {
        while (true) {
            var tasks = new ArrayList<Task<?>>();
            try {
                tasks.add(queue.take());
            } catch (InterruptedException e) {
                return;
            }
            queue.drainTo(tasks);

            while (!tryExecute(tasks));

            tasks.forEach(Task::completed);  // mark all tasks as committed
        }
    }, "Batch transaction processor");

    private static boolean tryExecute(List<Task<?>> tasks) {
        if (tasks.isEmpty()) {
            return true;
        }
        var txn = tasks.get(0).txn; // we assume that all tasks share same transactional
        txn.begin(TxnType.WRITE);
        try {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                if (!task.perform()) {
                    txn.abort();
                    txn.end();
                    it.remove();
                    task.completed(); // task failed, no need to wait for other tasks
                    return false;
                }
            }
            txn.commit();
            txn.end();
            return true;
        } catch (Throwable th) {
            try {
                txn.abort();
                txn.end();
            } catch (Throwable th2) {
                th.addSuppressed(th2);
            }
            throw th;
        }
    }

    public static void install() {
        var classLoader = BatchTransactions.class.getClassLoader();
        var type = TypePool.Default.of(classLoader).describe("org.apache.jena.system.Txn").resolve();
        new ByteBuddy()
                .redefine(type, ClassFileLocator.ForClassLoader.of(classLoader))
                .method(named("executeWrite").or(named("calculateWrite"))).intercept(to(BatchTransactions.class))
                .make()
                .load(classLoader, ClassLoadingStrategy.Default.INJECTION);

        worker.setDaemon(true);
        worker.start();
    }

    public static <T extends Transactional> void executeWrite(T txn, Runnable r) {
       calculateWrite(txn, () -> {
           r.run();
           return null;
       });
    }

    public static <T extends Transactional, X> X calculateWrite(T txn, Supplier<X> r) {
        try {
            if (currentThread() == worker) {
                return r.get();
            }

            var task = new Task<>(getThreadContext(), txn, r);

            queue.offer(task);
            return task.get();
        } catch (Throwable t) {
            return sneakyThrow(t);
        }
    }

    private static <T extends Throwable, R> R sneakyThrow(Throwable t) throws T {
        throw (T) t;
    }

    private static class Task<R> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final ThreadContext context;
        private final Transactional txn;
        private final Supplier<R> action;
        private R result;
        private Throwable error;

        Task(ThreadContext context, Transactional txn, Supplier<R> action) {
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
