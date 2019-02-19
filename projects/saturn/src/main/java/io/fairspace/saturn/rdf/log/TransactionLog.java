package io.fairspace.saturn.rdf.log;

public interface TransactionLog extends TransactionListener {
    long size();

    void read(long index, TransactionListener listener);
}
