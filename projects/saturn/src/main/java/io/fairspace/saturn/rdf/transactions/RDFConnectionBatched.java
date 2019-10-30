package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

public class RDFConnectionBatched extends RDFConnectionLocal implements WriteTransactionSupport {
    private final WriteTransactionSupport txnDelegate;

    public RDFConnectionBatched(Dataset dataset) {
        super(dataset, Isolation.COPY);

        txnDelegate = (WriteTransactionSupport) dataset.asDatasetGraph();
    }

    @Override
    public <T, E extends Exception> T write(ThrowingSupplier<T, E> action) throws E {
        return txnDelegate.write(action);
    }
}
