package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.services.users.UserService;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.CollectionResource;
import org.apache.jena.sparql.util.Context;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.Services.FS_ROOT;
import static io.fairspace.saturn.config.Services.USER_SERVICE;

// TODO: Use Permissions service instead of WebDAV
public class IndexDispatcher {
    private static final String[] ALL_INDEXES = {"_all"};
    private static final String COLLECTION_PREFIX = "collection_";
    private static final String SHARED_INDEX = "shared";

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
            return COLLECTION_PREFIX + collection.toLowerCase();
        }

        return SHARED_INDEX;
    }

    public String[] getAvailableIndexes() {
        UserService userService = context.get(USER_SERVICE);
        if (userService.currentUser().isAdmin()) {
            return ALL_INDEXES;
        }

        CollectionResource collectionsRoot = context.get(FS_ROOT);
        if (collectionsRoot == null) {
            return ALL_INDEXES;
        }

        try {
            return collectionsRoot.getChildren()
                    .stream()
                    .map(c -> COLLECTION_PREFIX + c.getName().toLowerCase())
                    .toArray(String[]::new);
        } catch (NotAuthorizedException | BadRequestException e) {
            throw new RuntimeException(e);
        }
    }
}
