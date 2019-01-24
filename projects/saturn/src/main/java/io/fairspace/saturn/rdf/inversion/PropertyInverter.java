package io.fairspace.saturn.rdf.inversion;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;

public class PropertyInverter {
    public static Dataset wrap(Dataset ds) {
        return DatasetFactory.wrap(new InvertingDatasetGraph(ds.asDatasetGraph()));
    }
}
