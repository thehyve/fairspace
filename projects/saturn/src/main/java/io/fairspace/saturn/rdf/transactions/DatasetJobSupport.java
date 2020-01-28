package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.system.Txn;

public interface DatasetJobSupport extends Dataset, JobSupport {
    default <E extends Exception> void executeWrite(ThrowingRunnable<E> job) throws E {
        calculateWrite(() -> {
            job.run();
            return null;
        });
    }

    default <X, E extends Exception> X calculateRead(ThrowingSupplier<X, E> r) throws E {
        return Txn.calculateRead(this, ThrowingSupplier.sneaky(r));
    }

    default  <E extends Exception> void executeRead(ThrowingRunnable<E> r) throws E {
        Txn.executeRead(this, ThrowingRunnable.sneaky(r));
    }
}
