package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.OutputStream;

public interface TransactionSerializer {
    void write(TransactionRecord transaction, OutputStream out) throws IOException;
}
