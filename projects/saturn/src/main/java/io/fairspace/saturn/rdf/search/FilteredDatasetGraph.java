package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.services.metadata.MetadataPermissions;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphFilteredView;
import org.apache.jena.sparql.core.DatasetImpl;
import org.apache.jena.sparql.core.Quad;

import java.util.Set;

import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

public class FilteredDatasetGraph extends DatasetGraphFilteredView {

    private static final ThreadLocal<Boolean> permissionCheckEnabled = ThreadLocal.withInitial(() -> true);

    public FilteredDatasetGraph(DatasetGraph dsg, MetadataPermissions permissions) {
        this(DatasetImpl.wrap(dsg), permissions);
    }

    private FilteredDatasetGraph(Dataset ds, MetadataPermissions permissions) {
        super(ds.asDatasetGraph(),
                q -> isAllowedToReadMetadata(ds, permissions, q),
                Set.of(defaultGraphIRI));
    }

    public static void disableQuadPermissionCheck() {
        permissionCheckEnabled.set(false);
    }

    public static void enableQuadPermissionCheck() {
        permissionCheckEnabled.set(true);
    }

    protected static boolean isAllowedToReadMetadata(Dataset ds, MetadataPermissions permissions, Quad quad) {
        boolean allowedToReadMetadata = quad.isDefaultGraph();
        if (allowedToReadMetadata && permissionCheckEnabled.get()) {
            allowedToReadMetadata = permissions
                    .canReadMetadata(ds.getDefaultModel().wrapAsResource(quad.getSubject()));
        }
        return allowedToReadMetadata;
    }
}
