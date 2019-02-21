package io.fairspace.saturn.rdf.transactions;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Enables writing and reading of transactions in a specific format.
 * The idea is to use one event-driven interface (TransactionListener) for both writing and reading,
 * similarly to SAX parser's approach.
 * That allows to avoid storing a whole transaction in memory.
 */
public interface TransactionCodec {
    /**
     * Creates a TransactionListener allowing to write to out.
     *
     * @param out An output stream to write to
     * @return A TransactionListener writing to out
     * @throws IOException
     */
    TransactionListener write(OutputStream out) throws IOException;

    /**
     * Reads a transaction from in, calling listener's methods
     *
     * @param in       An input stream to read from
     * @param listener A lister to handle transaction events
     * @throws IOException
     */
    void read(InputStream in, TransactionListener listener) throws IOException;
}
