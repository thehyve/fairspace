package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;

public interface TransactionLog extends TransactionListener {
    long size();

    void read(long index, TransactionListener listener) throws IOException;
}
