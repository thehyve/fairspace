package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingConsumer;
import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.util.Symbol;

public interface Transactions extends AutoCloseable {

    <R, E extends Exception> R calculateWrite(ThrowingFunction<? super Model, R, E> job) throws E;

    default <E extends Exception> void executeWrite(ThrowingConsumer<? super Model, E> job) throws E {
        calculateWrite(model -> {
            job.accept(model);
            return null;
        });
    }

    <R, E extends Exception> R calculateRead(ThrowingFunction<? super Model, R, E> job) throws E;

    default <E extends Exception> void executeRead(ThrowingConsumer<? super Model, E> job) throws E {
        calculateRead(model -> {
            job.accept(model);
            return null;
        });
    }

    void setContextValue(Symbol symbol, Object object);
}
