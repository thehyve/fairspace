package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingConsumer;
import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.query.Dataset;


public interface Transactions extends AutoCloseable {
    <R, E extends Exception> R calculateWrite(ThrowingFunction<? super Dataset, R, E> job) throws E;

    default <E extends Exception> void executeWrite(ThrowingConsumer<? super Dataset, E> job) throws E {
        calculateWrite(ds -> {
            job.accept(ds);
            return null;
        });
    }

    <R, E extends Exception> R calculateRead(ThrowingFunction<? super Dataset, R, E> job) throws E;

    default <E extends Exception> void executeRead(ThrowingConsumer<? super Dataset, E> job) throws E {
        calculateRead(ds -> {
            job.accept(ds);
            return null;
        });
    }
}
