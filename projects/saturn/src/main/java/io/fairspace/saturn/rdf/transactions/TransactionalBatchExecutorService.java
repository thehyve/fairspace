package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.sparql.core.Transactional;

import java.util.ArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;

import static io.fairspace.saturn.ThreadContext.*;
import static java.lang.Thread.currentThread;
import static org.apache.jena.system.Txn.executeWrite;

public class TransactionalBatchExecutorService {
    private final LinkedBlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();

    private final Thread worker;

    public TransactionalBatchExecutorService(Transactional transactional) {
        worker = new Thread(() -> {
            while (true) {
                var tasks = new ArrayList<Runnable>();
                try {
                    tasks.add(queue.take());
                } catch (InterruptedException e) {
                    return;
                }
                queue.drainTo(tasks);
                executeWrite(transactional, () -> tasks.forEach(Runnable::run));
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
        var task = new FutureTask<>(() -> {
            setThreadContext(ctx);
            return supplier.get();
        });
        queue.offer(task);

        try {
            return task.get();
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new RuntimeException(e);
        } catch (ExecutionException e) {
            var cause = e.getCause();
            if (cause == null) {
                throw new RuntimeException(e);
            }
            if (cause instanceof RuntimeException) {
                throw (RuntimeException) cause;
            } else {
                throw (E) cause;
            }
        }
    }

    public <E extends Exception> void perform(ThrowingRunnable<E> runnable) throws E {
        perform(() -> {
            runnable.run();
            return null;
        });
    }
}
