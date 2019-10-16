package io.fairspace.saturn.util;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static java.lang.Thread.currentThread;

public class BatchExecutorService {
    private final LinkedBlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();

    private final Thread worker = new Thread(() -> {
        while (true) {
            var tasks = new ArrayList<Runnable>();
            try {
                tasks.add(queue.take());
            } catch (InterruptedException e) {
                return;
            }
            queue.drainTo(tasks);
            execute(tasks);
        }
    });

    public BatchExecutorService() {
        worker.start();
    }

    public <T> Future<T> submit(Callable<T> callable) {
        var task = new FutureTask<>(callable);
        if (currentThread() == worker) {
            task.run();
        } else {
            queue.offer(task);
        }
        return task;
    }

    public <T, E extends Exception> T perform(ThrowingSupplier<T, E> callable) throws E {
        try {
            return submit(callable::get).get();
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

    protected void execute(List<Runnable> tasks) {
        tasks.forEach(Runnable::run);
    }
}
