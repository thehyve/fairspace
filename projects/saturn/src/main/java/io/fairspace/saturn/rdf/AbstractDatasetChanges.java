package io.fairspace.saturn.rdf;

import org.apache.jena.sparql.core.DatasetChanges;

public abstract class AbstractDatasetChanges implements DatasetChanges {
    @Override
    public void start() {
    }

    @Override
    public void finish() {
    }

    @Override
    public void reset() {
    }
}
