package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;

public interface TransactionLog {
    void log(TransactionRecord transaction) throws IOException;

    long size() throws IOException;

    TransactionRecord get(long index) throws IOException;
}
