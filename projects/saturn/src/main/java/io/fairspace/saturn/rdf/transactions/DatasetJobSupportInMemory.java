package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.sparql.core.DatasetImpl;
import org.apache.jena.system.Txn;

import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;

public class DatasetJobSupportInMemory extends DatasetImpl implements DatasetJobSupport {
    public DatasetJobSupportInMemory() {
        super(createTxnMem());
    }

    @Override
    public <X, E extends Exception> X calculateWrite(ThrowingSupplier<X, E> job) throws E {
        return Txn.calculateWrite(this, ThrowingSupplier.sneaky(job));
    }
}
