package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.rdfconnection.RDFConnection;

import static com.pivovarit.function.ThrowingSupplier.sneaky;
import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static org.apache.jena.system.Txn.calculateWrite;

public class TransactionUtils {
    public static <T, E extends Exception> T commit(String message, RDFConnection rdf, ThrowingSupplier<T, E> action) throws E {
        getThreadContext().setSystemCommitMessage(message);
        return calculateWrite(rdf, sneaky(action));
    }

    public static <E extends Exception> void commit(String message, RDFConnection rdf, ThrowingRunnable<E> action) throws E {
        commit(message, rdf, () -> {
            action.run();
            return null;
        });
    }
}
