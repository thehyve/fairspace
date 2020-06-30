package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.sparql.JenaTransactionException;
import org.apache.jena.system.Txn;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.auth.RequestContext.setCurrentRequest;
import static java.lang.Thread.currentThread;

public class BulkTransactions extends BaseTransactions {
    private final LinkedBlockingQueue<Task<?, ?>> queue = new LinkedBlockingQueue<>();
    private static final AtomicInteger threadCounter = new AtomicInteger();
    private final Thread worker = new Thread(() -> {
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
    }, "Batch transaction processor " + threadCounter.incrementAndGet());

    public BulkTransactions(Dataset ds) {
        super(ds);

        worker.start();
    }

    @Override
    public <R, E extends Exception> R calculateWrite(ThrowingFunction<? super Dataset, R, E> job) throws E {
        try {
            if (ds.isInTransaction()) {
                if (ds.transactionMode() == ReadWrite.WRITE) {
                    return job.apply(ds);
                }
                throw new JenaTransactionException("Can't promote to a write transaction");
            }

            var task = new Task<>(getCurrentRequest(), job);

            queue.offer(task);
            return task.get();
        } catch (Throwable t) {
            return sneakyThrow(t);
        }
    }

    private boolean tryExecute(List<Task<?, ?>> tasks) {
        if (tasks.isEmpty()) {
            return true;
        }

        return Txn.calculateWrite(ds, () -> {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                if (!task.perform(ds)) {
                    ds.abort();
                }
                if (!ds.isInTransaction()) {
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

    @Override
    public void close() throws Exception {
        worker.interrupt();
        try {
            worker.join();
        } catch (InterruptedException ignore) {
        }
        super.close();
    }

    private static class Task<R, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final HttpServletRequest request;
        private final ThrowingFunction<? super Dataset, R, E> job;
        private R result;
        private Throwable error;

        Task(HttpServletRequest request, ThrowingFunction<? super Dataset, R, E> job) {
            this.request = request;
            this.job = job;
        }

        boolean perform(Dataset ds) {
            try {
                setCurrentRequest(request);

                result = job.apply(ds);
                error = null;
                return true;
            } catch (Exception e) {
                result = null;
                error = e;
                return false;
            } finally {
                setCurrentRequest(null);
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
