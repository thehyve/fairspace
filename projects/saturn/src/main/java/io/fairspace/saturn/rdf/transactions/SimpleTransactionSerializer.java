package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.OutputStream;

/**
 * A TransactionSerializer using Java Serialization.
 */
public class SimpleTransactionSerializer implements TransactionSerializer {
    public static final TransactionSerializer INSTANCE = new SimpleTransactionSerializer();

    private SimpleTransactionSerializer() {
    }

    @Override
    public void write(TransactionRecord transaction, OutputStream out) throws IOException {
        try (var oos = new ObjectOutputStream(out)) {
            oos.writeObject(transaction);
        }
    }
}
