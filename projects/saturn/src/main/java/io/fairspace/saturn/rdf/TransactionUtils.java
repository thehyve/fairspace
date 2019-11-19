package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;

import static com.pivovarit.function.ThrowingSupplier.sneaky;
import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static org.apache.jena.system.Txn.calculateWrite;

public class TransactionUtils {
    public static <T, E extends Exception> T commit(String message, Dataset ds, ThrowingSupplier<T, E> action) throws E {
        var ctx = getThreadContext();
        if (ctx != null) {
          ctx.setSystemCommitMessage(message);
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
