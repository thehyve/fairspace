package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphWrapper;

public class DatasetGraphWrapperJobSupport extends DatasetGraphWrapper implements JobSupport {

    public <T extends DatasetGraph & JobSupport> DatasetGraphWrapperJobSupport(T dsg) {
        super(dsg);
    }

    @Override
    public <X, E extends Exception> X calculateWrite(ThrowingSupplier<X, E> job) throws E {
        return ((JobSupport)get()).calculateWrite(job);
    }
}
