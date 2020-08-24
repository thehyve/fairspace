package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingConsumer;
import com.pivovarit.function.ThrowingFunction;
import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.system.Txn;

public abstract class BaseTransactions implements Transactions {
    protected final Dataset ds;

    protected BaseTransactions(Dataset ds) {
        this.ds = ds;
    }

    @Override
    public <E extends Exception> void executeRead(ThrowingConsumer<? super Model, E> job) throws E {
        Txn.executeRead(ds, ThrowingRunnable.sneaky(() -> job.accept(ds.getDefaultModel())));
    }

    @Override
    public <R, E extends Exception> R calculateRead(ThrowingFunction<? super Model, R, E> job) throws E {
        return Txn.calculateRead(ds, ThrowingSupplier.sneaky(() -> job.apply(ds.getDefaultModel())));
    }

    @Override
    public void close() throws Exception {
        ds.close();
    }
}
