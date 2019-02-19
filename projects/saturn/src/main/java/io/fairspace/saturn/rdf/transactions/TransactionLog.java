package io.fairspace.saturn.rdf.transactions;

public interface TransactionLog extends TransactionListener {
    long size();

    void read(long index, TransactionListener listener);
}
