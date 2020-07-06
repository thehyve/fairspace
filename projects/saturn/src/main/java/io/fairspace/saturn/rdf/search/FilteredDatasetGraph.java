package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphFilteredView;

import java.util.Set;

import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

public class FilteredDatasetGraph extends DatasetGraphFilteredView {
    public FilteredDatasetGraph(DatasetGraph dsg, PermissionsService permissions) {
        super(dsg, q -> q.isDefaultGraph() && permissions.getPermission(q.getSubject()) != Access.None, Set.of(defaultGraphIRI));
    }
}
