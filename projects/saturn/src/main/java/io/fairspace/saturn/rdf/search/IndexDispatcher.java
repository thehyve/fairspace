package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.util.Context;

import java.util.stream.Stream;

import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.services.permissions.PermissionsService.PERMISSIONS_SERVICE;

public class IndexDispatcher {
    private static final String[] ALL_INDEXES = {"_all"};
    // TODO: Inject via context?
    private static final String collectionPrefix = CONFIG.publicUrl + "/api/v1/webdav/";
    private final Context context;

    public IndexDispatcher(Context context) {
        this.context = context;
    }


    public String getIndex(String uri) {
        if (uri.startsWith(collectionPrefix)) {
            var collection = uri.substring(collectionPrefix.length());
            var pos = collection.indexOf('/');
            if (pos > 0) {
                collection = collection.substring(0, pos);
            }
            return "collection_" + collection;
        }

        return "shared";
    }

    public String[] getAvailableIndexes() {
        if (isAdmin()) {
            return ALL_INDEXES;
        }

        var permissions = (PermissionsService) context.get(PERMISSIONS_SERVICE);
        if (permissions == null) {
            return ALL_INDEXES;
        }

        return Stream.concat(Stream.of("shared"),
                permissions.getVisibleCollections()
                        .stream()
                        .map(Node::getURI)
                        .map(this::getIndex))
                .toArray(String[]::new);
    }
}
