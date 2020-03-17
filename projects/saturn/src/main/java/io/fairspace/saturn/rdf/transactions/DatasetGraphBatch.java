package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.services.users.User;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.sparql.JenaTransactionException;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphWrapper;
import org.apache.jena.system.Txn;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import static io.fairspace.saturn.services.users.User.getCurrentUser;
import static io.fairspace.saturn.services.users.User.setCurrentUser;
import static java.lang.Thread.currentThread;

public class DatasetGraphBatch extends DatasetGraphWrapper implements JobSupport {
    private final LinkedBlockingQueue<Task<?, ?>> queue = new LinkedBlockingQueue<>();
    private static final AtomicInteger threadCounter = new AtomicInteger();
    private final Thread worker =  new Thread(() -> {
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

    public DatasetGraphBatch(DatasetGraph dsg) {
        super(dsg);

        worker.start();
    }

    @Override
    public <X, E extends Exception> X calculateWrite(ThrowingSupplier<X, E> job) throws E {
        try {
            if (isInTransaction()) {
                if (transactionMode() == ReadWrite.WRITE) {
                    return job.get();
                }
                throw new JenaTransactionException("Can't promote to a write transaction");
            }

            var task = new Task<>(getCurrentUser(), job);

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

        return Txn.calculateWrite(this, () -> {
            for (var it = tasks.iterator(); it.hasNext(); ) {
                var task = it.next();
                if (!task.perform()) {
                    abort();
                }
                if (!isInTransaction()) {
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
    public void close() {
        worker.interrupt();
        try {
            worker.join();
        } catch (InterruptedException ignore) {
        }
        super.close();
    }

    private static class Task<R, E extends Exception> {
        private final CountDownLatch canBeRead = new CountDownLatch(1);
        private final User user;
        private final ThrowingSupplier<R, E> job;
        private R result;
        private Throwable error;

        Task(User user, ThrowingSupplier<R, E> job) {
            this.user = user;
            this.job = job;
        }

        boolean perform() {
            try {
                setCurrentUser(user);

                result = job.get();
                error = null;
                return true;
            } catch (Exception e) {
                result = null;
                error = e;
                return false;
            } finally {
                setCurrentUser(null);
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
