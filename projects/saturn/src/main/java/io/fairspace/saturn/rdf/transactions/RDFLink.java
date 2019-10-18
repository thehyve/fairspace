package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingConsumer;
import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.SparqlQueryConnection;

public interface RDFLink {
    <R, E extends Exception> R calculateRead(ThrowingFunction<? super SparqlQueryConnection, ? extends R, ? extends E> job) throws E;

    <R, E extends Exception> R calculateWrite(String systemCommitMessage, ThrowingFunction<? super RDFConnection, ? extends R, ? extends E> job) throws E;

    default <E extends Exception> void executeRead(ThrowingConsumer<? super SparqlQueryConnection, ? extends E> job) throws E {
        calculateRead(rdf -> {
            job.accept(rdf);
            return null;
        });
    }

    default <E extends Exception> void executeWrite(String systemCommitMessage, ThrowingConsumer<? super RDFConnection, ? extends E> job) throws E {
        calculateWrite(systemCommitMessage, rdf -> {
            job.accept(rdf);
            return null;
        });
    }

    default <R, E extends Exception> R calculateWrite(ThrowingFunction<? super RDFConnection, ? extends R, ? extends E> job) throws E {
        return calculateWrite(null, job);
    }

    default <E extends Exception> void executeWrite(ThrowingConsumer<? super RDFConnection, ? extends E> job) throws E {
        executeWrite(null, job);
    }
}
