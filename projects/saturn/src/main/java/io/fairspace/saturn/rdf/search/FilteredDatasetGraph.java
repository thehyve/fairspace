package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.services.metadata.MetadataPermissions;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphFilteredView;
import org.apache.jena.sparql.core.DatasetImpl;

import java.util.Set;

import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

public class FilteredDatasetGraph extends DatasetGraphFilteredView {
    public FilteredDatasetGraph(DatasetGraph dsg, MetadataPermissions permissions) {
        this(DatasetImpl.wrap(dsg), permissions);
    }

    public FilteredDatasetGraph(Dataset ds, MetadataPermissions permissions) {
        super(ds.asDatasetGraph(),
                q -> q.isDefaultGraph()
                        && permissions.canReadMetadata(ds.getDefaultModel().wrapAsResource(q.getSubject())),
                Set.of(defaultGraphIRI));
    }
}
