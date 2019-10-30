package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;

public interface WriteTransactionSupport {
     <T, E extends Exception> T write(ThrowingSupplier<T, E> action) throws E;
}
