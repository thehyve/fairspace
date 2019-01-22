package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.InputStream;

public interface TransactionDeserializer {
    TransactionRecord read(InputStream in) throws IOException;
}
