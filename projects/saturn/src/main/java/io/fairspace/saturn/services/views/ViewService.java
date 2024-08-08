package io.fairspace.saturn.services.views;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.QuerySolutionMap;
import org.apache.jena.rdf.model.Literal;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.search.FilteredDatasetGraph;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.vocabulary.FS;

import static io.fairspace.saturn.config.ViewsConfig.ColumnType;
import static io.fairspace.saturn.config.ViewsConfig.View;

import static java.time.Instant.ofEpochMilli;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.calculateRead;

@Log4j2
public class ViewService {

    private static final Query VALUES_QUERY = QueryFactory.create(String.format(
            """
            PREFIX fs: <%s>
            PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?value ?label
            WHERE {
               ?value a ?type ; rdfs:label ?label .
               FILTER EXISTS {
                  ?subject ?predicate ?value
                  FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
               }
               FILTER NOT EXISTS { ?value fs:dateDeleted ?anyDateDeleted }
            } ORDER BY ?label
            """,
            FS.NS));

    private static final Query RESOURCE_TYPE_VALUES_QUERY = QueryFactory.create(String.format(
            """
            PREFIX fs: <%s>
            SELECT ?value ?label
            WHERE {
               VALUES (?value ?label) {
                  (fs:Collection "Collection")
                  (fs:Directory "Directory")
                  (fs:File "File")
               }
            }
            """,
            FS.NS));

    private static final Query BOUNDS_QUERY = QueryFactory.create(String.format(
            """
            PREFIX fs: <%s>

            SELECT (MIN(?value) AS ?min) (MAX(?value) AS ?max)
            WHERE {
               ?subject ?predicate ?value
               FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
            }
            """,
            FS.NS));

    private static final Query BOOLEAN_VALUE_QUERY = QueryFactory.create(String.format(
            """
            PREFIX fs: <%s>
            SELECT ?booleanValue
            WHERE {
               ?subject ?predicate ?booleanValue
               FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
            }
            """,
            FS.NS));
    public static final String USER_DOES_NOT_HAVE_PERMISSIONS_TO_READ_FACETS =
            "User does not have permissions to read facets";

    private final Config.Search searchConfig;
    private final ViewsConfig viewsConfig;
    private final Dataset ds;
    private final ViewStoreClientFactory viewStoreClientFactory;
    private final MetadataPermissions metadataPermissions;
    private final LoadingCache<Boolean, List<FacetDTO>> facetsCache;
    private final LoadingCache<Boolean, List<ViewDTO>> viewsCache;

    public ViewService(
            Config config,
            ViewsConfig viewsConfig,
            Dataset ds,
            ViewStoreClientFactory viewStoreClientFactory,
            MetadataPermissions metadataPermissions) {
        this.searchConfig = config.search;
        this.viewsConfig = viewsConfig;
        this.ds = ds;
        this.viewStoreClientFactory = viewStoreClientFactory;
        this.metadataPermissions = metadataPermissions;
        this.facetsCache = buildCache(this::fetchFacets, config.caches.facets);
        this.viewsCache = buildCache(this::fetchViews, config.caches.views);
        refreshCaches();
    }

    public void refreshCaches() {
        log.info("Caches refreshing/warming up has been triggered");
        try {
            FilteredDatasetGraph.disableQuadPermissionCheck();
            facetsCache.refresh(Boolean.TRUE);
            viewsCache.refresh(Boolean.TRUE);
        } finally {
            FilteredDatasetGraph.enableQuadPermissionCheck();
        }
        log.info("Caches refreshing/warming up successfully finished");
    }

    public List<FacetDTO> getFacets() {
        if (!metadataPermissions.canReadFacets()) {
            // this check is needed for cached data only as, otherwise,
            // the check will be performed during retrieving data from Jena
            throw new AccessDeniedException(USER_DOES_NOT_HAVE_PERMISSIONS_TO_READ_FACETS);
        }
        try {
            return facetsCache.get(Boolean.TRUE);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    public List<ViewDTO> getViews() {
        try {
            return viewsCache.get(Boolean.TRUE);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    protected List<ViewDTO> fetchViews() {
        return viewsConfig.views.stream()
                .map(v -> {
                    var columns = new ArrayList<ColumnDTO>();

                    // The entity label is the first column displayed,
                    // if you want a column before this label, assign a negative displayIndex value in views.yaml
                    final int ENTITY_LABEL_INDEX = 0;

                    columns.add(new ColumnDTO(
                            v.name,
                            v.itemName == null ? v.name : v.itemName,
                            ColumnType.Identifier,
                            ENTITY_LABEL_INDEX));
                    for (var c : v.columns) {
                        columns.add(new ColumnDTO(v.name + "_" + c.name, c.title, c.type, c.displayIndex));
                    }
                    for (var j : v.join) {
                        var joinView = viewsConfig.views.stream()
                                .filter(view -> view.name.equalsIgnoreCase(j.view))
                                .findFirst()
                                .orElse(null);
                        if (joinView == null) {
                            continue;
                        }
                        if (j.include.contains("id")) {
                            columns.add(new ColumnDTO(
                                    joinView.name, joinView.title, ColumnType.Identifier, j.displayIndex));
                        }
                        for (var c : joinView.columns) {
                            if (!j.include.contains(c.name)) {
                                continue;
                            }
                            columns.add(new ColumnDTO(joinView.name + "_" + c.name, c.title, c.type, j.displayIndex));
                        }
                    }
                    Long maxDisplayCount = viewsConfig
                            .getViewConfig(v.name)
                            .map(t -> t.maxDisplayCount)
                            .orElse(null);
                    return new ViewDTO(v.name, v.title, columns, maxDisplayCount);
                })
                .collect(toList());
    }

    protected List<FacetDTO> fetchFacets() {
        return calculateRead(ds, () -> viewsConfig.views.stream()
                .flatMap(view -> view.columns.stream()
                        .map(column -> getFacetInfo(view, column))
                        .filter(f -> (f.getMin() != null
                                || f.getMax() != null
                                || (f.getValues() != null && f.getValues().size() > 1)
                                || f.getBooleanValue() != null)))
                .collect(toList()));
    }

    private FacetDTO getFacetInfo(View view, View.Column column) {
        List<ValueDTO> values = null;
        Object min = null;
        Object max = null;
        Boolean booleanValue = null;

        switch (column.type) {
            case Term, TermSet -> {
                var query = (view.name.equalsIgnoreCase("Resource") && column.name.equalsIgnoreCase("type"))
                        ? RESOURCE_TYPE_VALUES_QUERY
                        : VALUES_QUERY;
                var binding = new QuerySolutionMap();
                binding.add("type", createResource(column.rdfType));
                binding.add("predicate", createResource(column.source));

                values = new ArrayList<>();
                try (var execution = QueryExecutionFactory.create(query, ds, binding)) {
                    //noinspection NullableProblems
                    for (var row : (Iterable<QuerySolution>) execution::execSelect) {
                        var resource = row.getResource("value");
                        var label = row.getLiteral("label").getString();
                        values.add(new ValueDTO(label, resource.getURI()));
                    }
                }
            }
            case Boolean -> {
                var binding = new QuerySolutionMap();
                binding.add("predicate", createResource(column.source));
                try (var execution = QueryExecutionFactory.create(BOOLEAN_VALUE_QUERY, ds, binding)) {
                    var rowExec = execution.execSelect();
                    // TODO: should we check all results until it's not null (not the first element only)?
                    if (rowExec.hasNext()) {
                        booleanValue = (Boolean) ofNullable(rowExec.next().getLiteral("booleanValue"))
                                .map(Literal::getValue)
                                .map(this::convertLiteralValue)
                                .orElse(null);
                    }
                }
            }
            case Number, Date -> {
                if (viewStoreClientFactory != null) {
                    var range = getColumnRange(view, column);
                    if (range != null) {
                        min = range.getStart();
                        max = range.getEnd();
                    }
                } else {
                    var binding = new QuerySolutionMap();
                    binding.add("predicate", createResource(column.source));

                    try (var execution = QueryExecutionFactory.create(BOUNDS_QUERY, ds, binding)) {
                        var row = execution.execSelect().next();
                        min = ofNullable(row.getLiteral("min"))
                                .map(Literal::getValue)
                                .map(this::convertLiteralValue)
                                .orElse(null);
                        max = ofNullable(row.getLiteral("max"))
                                .map(Literal::getValue)
                                .map(this::convertLiteralValue)
                                .orElse(null);
                    }
                }
            }
        }

        return new FacetDTO(view.name + "_" + column.name, column.title, column.type, values, booleanValue, min, max);
    }

    private Object convertLiteralValue(Object value) {
        if (value instanceof XSDDateTime) {
            return ofEpochMilli(((XSDDateTime) value).asCalendar().getTimeInMillis());
        }
        return value;
    }

    @SneakyThrows
    private Range getColumnRange(View view, View.Column column) {
        if (!EnumSet.of(ColumnType.Date, ColumnType.Number).contains(column.type)) {
            return null;
        }
        try (var reader = new ViewStoreReader(searchConfig, viewsConfig, viewStoreClientFactory)) {
            return reader.aggregate(view.name, column.name);
        }
    }

    private <T> LoadingCache<Boolean, List<T>> buildCache(
            Supplier<List<T>> fetchSupplier, Config.CacheConfig cacheConfig) {
        var cacheBuilder = CacheBuilder.newBuilder();
        if (cacheConfig.autoRefreshEnabled) {
            cacheBuilder.refreshAfterWrite(cacheConfig.refreshFrequencyInHours, TimeUnit.HOURS);
        }
        return cacheBuilder.build(new CacheLoader<>() {
            @Override
            public List<T> load(Boolean key) {
                var cachedObjects = fetchSupplier.get();
                log.info(
                        "List of {} has been cached, {} {} in total",
                        cacheConfig.name,
                        cachedObjects.size(),
                        cacheConfig.name);
                return cachedObjects;
            }
        });
    }
}
