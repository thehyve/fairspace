package io.fairspace.saturn.search;

import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphFilteredView;

import java.util.Set;

import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

public class SearchableDatasetGraph extends DatasetGraphFilteredView {
    public SearchableDatasetGraph(DatasetGraph dsg, PermissionsService permissions) {
        super(dsg, q -> q.isDefaultGraph() && permissions.getPermission(q.getSubject()).canRead(), Set.of(defaultGraphIRI));
    }

    @Override
    public void commit() {
        super.commit();
    }

    @Override
    public void abort() {
        super.abort();
    }

    @Override
    public void end() {
        super.end();
    }
}
