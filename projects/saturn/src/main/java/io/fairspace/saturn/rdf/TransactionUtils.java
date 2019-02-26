package io.fairspace.saturn.rdf;

import org.apache.jena.sparql.core.Transactional;

import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static org.apache.jena.system.Txn.calculateWrite;
import static org.apache.jena.system.Txn.executeWrite;

public class TransactionUtils {
    public static void commit(String message, Transactional transactional, Runnable action) {
        withCommitMessage(message, () -> executeWrite(transactional, action));
    }

    public static <T> T commit(String message, Transactional transactional, Supplier<T> action) {
        return withCommitMessage(message, () -> calculateWrite(transactional, action));
    }
}
