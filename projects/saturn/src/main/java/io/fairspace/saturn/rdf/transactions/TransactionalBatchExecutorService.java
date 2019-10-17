package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.sparql.core.Transactional;

import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.Thread.currentThread;
import static org.apache.jena.system.Txn.executeWrite;

public class TransactionalBatchExecutorService {
    private final LinkedBlockingQueue<PartialTask<?, ?>> queue = new LinkedBlockingQueue<>();

    private final Thread worker;

    public TransactionalBatchExecutorService(Transactional transactional) {
        worker = new Thread(() -> {
            while (true) {
                var tasks = new ArrayList<PartialTask<?, ?>>();
                try {
                    tasks.add(queue.take());
                } catch (InterruptedException e) {
                    return;
                }
                queue.drainTo(tasks);
                executeWrite(transactional, () -> tasks.forEach(PartialTask::run));
                tasks.forEach(PartialTask::batchCompleted);
                cleanThreadContext();
            }
        });
        worker.start();
    }

    public <T, E extends Exception> T perform(ThrowingSupplier<T, E> supplier) throws E {
        if (currentThread() == worker) {
            return supplier.get();
        }

        var ctx = getThreadContext();
        var task = new PartialTask<>(() -> {
            setThreadContext(ctx);
            return supplier.get();
        });
        queue.offer(task);

        return task.get();
    }

    public <E extends Exception> void perform(ThrowingRunnable<E> runnable) throws E {
        perform(() -> {
            runnable.run();
            return null;
        });
    }

    private static class PartialTask<T, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final ThrowingSupplier<T, E> supplier;
        private T result;
        private Exception error;

        private PartialTask(ThrowingSupplier<T, E> supplier) {
            this.supplier = supplier;
        }

        void run() {
            try {
                result = supplier.get();
            } catch (Exception e) {
                error = e;
                canBeRead.countDown(); // No need to wait until the transaction is committed
            }
        }

        T get() throws E {
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

        void batchCompleted() {
            canBeRead.countDown();
        }
    }
}
