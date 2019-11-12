package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.rdf.transactions.WriteTransactionSupport;
import org.apache.jena.query.Dataset;

import static com.pivovarit.function.ThrowingSupplier.sneaky;
import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static org.apache.jena.system.Txn.calculateWrite;

public class TransactionUtils {
    private static final boolean USE_BATCHING = true;

    public static <T, E extends Exception> T commit(String message, Dataset ds, ThrowingSupplier<T, E> action) throws E {
        getThreadContext().setSystemCommitMessage(message);

        if (USE_BATCHING && ds.asDatasetGraph() instanceof WriteTransactionSupport) {
            return ((WriteTransactionSupport) ds.asDatasetGraph()).write(action);
        }

        return calculateWrite(ds, sneaky(action));
    }

    public static <E extends Exception> void commit(String message, Dataset ds, ThrowingRunnable<E> action) throws E {
        commit(message, ds, () -> {
            action.run();
            return null;
        });
    }
}
