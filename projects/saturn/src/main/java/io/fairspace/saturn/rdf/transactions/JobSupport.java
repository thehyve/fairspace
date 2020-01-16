package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;

public interface JobSupport {
    <X, E extends Exception> X calculateWrite(ThrowingSupplier<X, E> job) throws E;
}
