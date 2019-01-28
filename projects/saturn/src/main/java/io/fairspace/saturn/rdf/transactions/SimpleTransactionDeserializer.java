package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;

public class SimpleTransactionDeserializer implements TransactionDeserializer {
    public static final TransactionDeserializer INSTANCE = new SimpleTransactionDeserializer();

    private SimpleTransactionDeserializer() {
    }

    @Override
    public TransactionRecord read(InputStream in) throws IOException {
        try (var ois = new ObjectInputStream(in)) {
            return (TransactionRecord) ois.readObject();
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
