package io.fairspace.saturn.rdf.transactions;

import java.io.*;

public class JavaSerializationTransactionCodec implements TransactionCodec {
    public static final TransactionCodec INSTANCE = new JavaSerializationTransactionCodec();

    private JavaSerializationTransactionCodec() {
    }

    @Override
    public void write(TransactionRecord transaction, OutputStream out) throws IOException {
        try (var oos = new ObjectOutputStream(out)) {
            oos.writeObject(transaction);
        }
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
