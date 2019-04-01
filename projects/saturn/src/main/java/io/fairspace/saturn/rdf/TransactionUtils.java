package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import lombok.SneakyThrows;
import org.apache.jena.sparql.core.Transactional;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static org.apache.jena.system.Txn.*;

public class TransactionUtils {
    public static void commit(String message, Transactional transactional, ThrowingRunnable<?> action) {
        withCommitMessage(message, () -> executeWrite(transactional, () -> sneaky(() -> {
            action.run();
            return null;
        })));
    }

    public static <T> T commit(String message, Transactional transactional, ThrowingSupplier<T, ?> action) {
        return withCommitMessage(message, () -> calculateWrite(transactional, () -> sneaky(action)));
    }

    public static <T> T transactionally(Transactional transactional, ThrowingSupplier<T, ?> action) {
        return calculateRead(transactional, () -> sneaky(action));
    }

    @SneakyThrows(Exception.class)
    private static <R> R sneaky(ThrowingSupplier<R, ?> action) {
        return action.get();
    }
}
