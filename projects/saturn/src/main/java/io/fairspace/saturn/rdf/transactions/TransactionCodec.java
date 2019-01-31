package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface TransactionCodec {
    void write(TransactionRecord transaction, OutputStream out) throws IOException;
    TransactionRecord read(InputStream in) throws IOException;
}
