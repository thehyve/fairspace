package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.util.BatchExecutorService;
import org.apache.jena.sparql.core.Transactional;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;

import static io.fairspace.saturn.Context.threadContext;
import static org.apache.jena.system.Txn.executeWrite;

public class TransactionalBatchExecutorService extends BatchExecutorService {
    private final Transactional transactional;

    public TransactionalBatchExecutorService(Transactional transactional) {
        this.transactional = transactional;
    }

    @Override
    public <T> Future<T> submit(Callable<T> callable) {
        var ctx = threadContext.get();
        return super.submit(() -> {
            threadContext.set(ctx);
            return callable.call();
        });
    }

    @Override
    protected void execute(List<Runnable> tasks) {
        executeWrite(transactional, () -> super.execute(tasks));
        threadContext.remove();
    }
}
