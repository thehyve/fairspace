package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetImpl;

public class DatasetJobSupportImpl extends DatasetImpl implements DatasetJobSupport {
    private final JobSupport jobSupport;

    public <T extends DatasetGraph & JobSupport> DatasetJobSupportImpl(T dsg) {
        super(dsg);

        jobSupport = dsg;
    }

    @Override
    public <X, E extends Exception> X calculateWrite(ThrowingSupplier<X, E> job) throws E {
        return jobSupport.calculateWrite(job);
    }
}
