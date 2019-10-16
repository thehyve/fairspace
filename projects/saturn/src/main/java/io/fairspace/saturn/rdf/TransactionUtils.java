package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.rdf.transactions.TransactionalBatchExecutorService;
import lombok.SneakyThrows;
import org.apache.jena.sparql.core.Transactional;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static org.apache.jena.system.Txn.calculateWrite;
import static org.apache.jena.system.Txn.executeWrite;

public class TransactionUtils {
    @Deprecated
    public static void commit(String message, Transactional transactional, ThrowingRunnable<?> action) {
        withCommitMessage(message, () -> executeWrite(transactional, () -> sneaky(() -> {
            action.run();
            return null;
        })));
    }

    @Deprecated
    public static <T> T commit(String message, Transactional transactional, ThrowingSupplier<T, ?> action) {
        return withCommitMessage(message, () -> calculateWrite(transactional, () -> sneaky(action)));
    }

    public static void commit(String message, TransactionalBatchExecutorService executor, ThrowingRunnable<?> action) {
        withCommitMessage(message, () -> executor.perform(action));
    }

    public static <T> T commit(String message, TransactionalBatchExecutorService executor, ThrowingSupplier<T, ?> action) {
        return withCommitMessage(message, () -> executor.perform(action::get));
    }

    @SneakyThrows(Exception.class)
    private static <R> R sneaky(ThrowingSupplier<R, ?> action) {
        return action.get();
    }
}
