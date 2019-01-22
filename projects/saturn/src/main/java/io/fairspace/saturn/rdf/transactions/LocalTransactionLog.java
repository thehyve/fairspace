package io.fairspace.saturn.rdf.transactions;

import java.io.*;
import java.util.concurrent.atomic.AtomicLong;

public class LocalTransactionLog implements TransactionLog {
    private final File directory;
    private final TransactionSerializer serializer;
    private final AtomicLong counter = new AtomicLong();

    public LocalTransactionLog(File directory, TransactionSerializer serializer) {
        this.directory = directory;
        this.serializer = serializer;

        directory.mkdirs();
        counter.set(directory.list((dir, name) -> name.startsWith("tx-")).length);
    }

    @Override
    public void log(TransactionRecord transaction) throws IOException {
        File file = new File(directory, "tx-" + counter.incrementAndGet());
        try (OutputStream out = new BufferedOutputStream(new FileOutputStream(file))) {
            serializer.write(transaction, out);
        }
    }
}
