package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.search.FileSearchRequest;
import io.fairspace.saturn.services.search.SearchResultDTO;
import io.milton.resource.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import io.milton.resource.*;
import lombok.*;

import java.net.*;
import java.nio.charset.*;
import java.sql.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.*;

import static java.lang.Integer.*;

@Slf4j
public class JdbcQueryService implements QueryService {
    @Getter
    private final ViewStoreReader viewStoreReader;
    private final Transactions transactions;
    private final CollectionResource rootSubject;

    public JdbcQueryService(Config.Search searchConfig, ViewStoreClient viewStoreClient, Transactions transactions, CollectionResource rootSubject) {
        this.viewStoreReader = new ViewStoreReader(searchConfig, viewStoreClient);
        this.transactions = transactions;
        this.rootSubject = rootSubject;
    }

    public String getCollectionName(String uri) {
        var rootLocation = rootSubject.getUniqueId() + "/";
        var location = uri.substring(rootLocation.length());
        return URLDecoder.decode(location.split("/")[0], StandardCharsets.UTF_8);
    }

    @SneakyThrows
    protected void applyCollectionsFilterIfRequired(String view, List<ViewFilter> filters) {
        boolean collectionsFilterRequired = view.equalsIgnoreCase("Resource") ||
                filters.stream().anyMatch(
                        filter -> filter.getField().split("_")[0].equalsIgnoreCase("Resource"));
        if (!collectionsFilterRequired) {
            return;
        }
        var collections = transactions.calculateRead(m ->
                rootSubject.getChildren().stream()
                        .map(collection -> (Object) getCollectionName(collection.getUniqueId()))
                        .collect(Collectors.toList()));
        if (filters.stream()
                .anyMatch(filter -> filter.getField().equalsIgnoreCase("Resource_collection"))) {
            // Update existing filters in place
            filters.stream()
                    .filter(filter -> filter.getField().equalsIgnoreCase("Resource_collection"))
                    .forEach(filter -> filter.setValues(
                            filter.values.stream()
                                    .map(value -> getCollectionName(value.toString()))
                                    .filter(collections::contains).collect(Collectors.toList()))
                    );
            return;
        }
        // Add collection name filter
        filters.add(ViewFilter.builder()
                .field("Resource_collection")
                .values(collections)
                .build());
    }

    public ViewPageDTO retrieveViewPage(ViewRequest request) {
        int page = (request.getPage() != null && request.getPage() >= 1) ? request.getPage() : 1;
        int size = (request.getSize() != null && request.getSize() >= 1) ? request.getSize() : 20;
        var filters = new ArrayList<ViewFilter>();
        if (request.getFilters() != null) {
            filters.addAll(request.getFilters());
        }
        applyCollectionsFilterIfRequired(request.getView(), filters);
        try {
            List<Map<String, Set<ValueDTO>>> rows = viewStoreReader.retrieveRows(
                    request.getView(), filters,
                    (page - 1) * size,
                    size + 1,
                    request.includeJoinedViews()
            );
            var pageBuilder = ViewPageDTO.builder()
                    .rows(rows.subList(0, min(size, rows.size())))
                    .hasNext(rows.size() > size);
            if (request.includeCounts()) {
                long count = viewStoreReader.countRows(request.getView(), filters);
                pageBuilder = pageBuilder
                        .totalCount(count)
                        .totalPages(count / size + ((count % size > 0) ? 1 : 0));
            }
            return pageBuilder.build();
        } catch (SQLTimeoutException e) {
            return ViewPageDTO.builder()
                    .rows(Collections.emptyList())
                    .timeout(true)
                    .build();
        }
    }

    public CountDTO count(CountRequest request) {
        var filters = request.getFilters();
        if (filters == null) {
            filters = new ArrayList<>();
        }
        applyCollectionsFilterIfRequired(request.getView(), filters);
        try {
            return new CountDTO(viewStoreReader.countRows(request.getView(), filters), false);
        } catch (SQLTimeoutException e) {
            return new CountDTO(0, true);
        }
    }

    public ArrayList<SearchResultDTO> getFilesByText(FileSearchRequest request) {
        var query = """
                SELECT id, label, type FROM public.resource
                WHERE label like '%{searchTerm}%'
                ORDER BY id ASC LIMIT 1000""";

        query = query.replaceAll("\\{searchTerm}", request.getQuery());

        try {
            return viewStoreReader.retrieveViewTableRows(query, this::GetSearchResult);
        } catch (SQLException e) {
            log.error("Error connecting to the view database.", e);
            throw new RuntimeException("Error connecting to the view database", e); // Terminates Saturn
        }
    }

    @SneakyThrows
    private ArrayList<SearchResultDTO> GetSearchResult(ResultSet resultSet) {
        var rows = new ArrayList<SearchResultDTO>();
        while (resultSet.next()) {
            var row = SearchResultDTO.builder()
                    .id(resultSet.getString("id"))
                    .label(resultSet.getString("label"))
                    .type(resultSet.getString("type"))
                    .comment("")
                    .build();

            rows.add(row);
        }
        return rows;
    }
}
