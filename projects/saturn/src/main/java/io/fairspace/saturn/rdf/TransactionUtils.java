package io.fairspace.saturn.rdf;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.rdf.transactions.TransactionalBatchExecutorService;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;

public class TransactionUtils {

    public static <E extends Exception> void commit(String message, TransactionalBatchExecutorService executor, ThrowingRunnable<E> action) throws E {
        withCommitMessage(message, () -> executor.perform(action));
    }

    public static <T, E extends Exception> T commit(String message, TransactionalBatchExecutorService executor, ThrowingSupplier<T, E> action) throws E {
        return withCommitMessage(message, () -> executor.perform(action));
    }
}
