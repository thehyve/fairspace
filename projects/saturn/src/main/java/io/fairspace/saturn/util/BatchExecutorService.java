package io.fairspace.saturn.util;

import com.pivovarit.function.ThrowingRunnable;

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
        queue.offer(task);
        return task;
    }

    public <T> T perform(Callable<T> callable) {
        try {
            return submit(callable).get();
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
                throw new RuntimeException(cause);
            }
        }
    }

    public void perform(ThrowingRunnable runnable) {
        perform(() -> {
            runnable.run();
            return null;
        });
    }

    protected void execute(List<Runnable> tasks) {
        tasks.forEach(Runnable::run);
    }
}
