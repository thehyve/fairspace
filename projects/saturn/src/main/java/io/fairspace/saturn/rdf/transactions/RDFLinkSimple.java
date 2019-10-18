package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.rdfconnection.SparqlQueryConnection;
import org.apache.jena.system.Txn;

import static com.pivovarit.function.ThrowingFunction.sneaky;
import static io.fairspace.saturn.ThreadContext.getThreadContext;

public class RDFLinkSimple implements RDFLink {
    private final RDFConnection rdf;

    public RDFLinkSimple(RDFConnection rdf) {
        this.rdf = rdf;
    }

    public RDFLinkSimple(Dataset ds) {
        this(new RDFConnectionLocal(ds, Isolation.COPY));
    }

    @Override
    public <R, E extends Exception> R calculateRead(ThrowingFunction<? super SparqlQueryConnection, ? extends R, ? extends E> job) throws E {
        return Txn.calculateRead(rdf, () -> sneaky(job).apply(rdf));
    }

    @Override
    public <R, E extends Exception> R calculateWrite(String message, ThrowingFunction<? super RDFConnection, ? extends R, ? extends E> job) throws E {
        getThreadContext().setSystemCommitMessage(message);
        return Txn.calculateWrite(rdf, () -> sneaky(job).apply(rdf));
    }
}
