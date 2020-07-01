package io.fairspace.saturn.rdf.search;

import java.util.function.Function;

public class IndexDispatcher implements Function<String, String> {
    private final String collectionPrefix;

    public IndexDispatcher(String collectionPrefix) {
        this.collectionPrefix = collectionPrefix;
    }

    @Override
    public String apply(String id) {
        if (id.startsWith(collectionPrefix)) {
            var collection = id.substring(collectionPrefix.length());
            var pos = collection.indexOf('/');
            if (pos > 0) {
                collection = collection.substring(0, pos);
            }
            return "collection_" + collection;
        }

        return "shared";
    }
}
