package io.fairspace.saturn.services.search;

import java.util.List;
import java.util.stream.Collectors;

import io.milton.resource.CollectionResource;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;

import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;
import io.fairspace.saturn.services.views.ViewStoreReader;

import static io.fairspace.saturn.webdav.PathUtils.getCollectionNameByUri;

@Log4j2
public class JdbcFileSearchService implements FileSearchService {
    private final Transactions transactions;
    private final CollectionResource rootSubject;
    private final SearchProperties searchProperties;
    private final ViewsConfig viewsConfig;
    private final ViewStoreClientFactory viewStoreClientFactory;

    public JdbcFileSearchService(
            SearchProperties searchProperties,
            ViewsConfig viewsConfig,
            ViewStoreClientFactory viewStoreClientFactory,
            Transactions transactions,
            CollectionResource rootSubject) {
        this.searchProperties = searchProperties;
        this.viewStoreClientFactory = viewStoreClientFactory;
        this.transactions = transactions;
        this.rootSubject = rootSubject;
        this.viewsConfig = viewsConfig;
    }

    @SneakyThrows
    public List<SearchResultDTO> searchFiles(FileSearchRequest request) {
        var collectionsForUser = transactions.calculateRead(m -> rootSubject.getChildren().stream()
                .map(collection -> getCollectionNameByUri(rootSubject.getUniqueId(), collection.getUniqueId()))
                .collect(Collectors.toList()));

        try (var viewStoreReader = new ViewStoreReader(searchProperties, viewsConfig, viewStoreClientFactory)) {
            return viewStoreReader.searchFiles(request, collectionsForUser);
        }
    }
}
