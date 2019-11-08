package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.ThreadContext;
import org.apache.jena.sparql.core.DatasetGraph;

import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.Thread.currentThread;
import static org.apache.jena.system.Txn.calculateWrite;

public final class TxnLogDatasetGraphBatched extends TxnLogDatasetGraph {
    private final LinkedBlockingQueue<Task<?, ?>> queue = new LinkedBlockingQueue<>();
    private final Thread worker = new Thread(() -> {
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

    public TxnLogDatasetGraphBatched(DatasetGraph dsg, TransactionLog transactionLog) {
        super(dsg, transactionLog);

        worker.start();
    }


    @Override
    public <T, E extends Exception> T write(ThrowingSupplier<T, E> action) throws E {
        if (currentThread() == worker) {
            return action.get();
        }

        var task = new Task<>(getThreadContext(), action);
        queue.offer(task);
        return task.get();
    }

    @Override
    public void close() {
        worker.interrupt();
        super.close();
    }

    private boolean tryExecute(Collection<Task<?, ?>> tasks) {
        return tasks.isEmpty() || calculateWrite(this, () -> {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                try {
                    task.apply();
                } catch (Exception e) {
                    // abort the transaction, exclude the failed task and retry
                    abort();
                    it.remove();
                    return false;
                }
            }
            return true; // success
        });
    }

    private class Task<R, E extends Exception> {
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
                setThreadContext(context);
                grabTransactionMetadataFromContext();

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
