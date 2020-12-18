package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.webdav.*;
import io.milton.http.exceptions.*;
import io.milton.resource.*;
import lombok.extern.slf4j.*;
import org.apache.jena.query.*;
import org.apache.jena.system.Txn;
import org.apache.jena.vocabulary.RDFS;

import java.net.*;
import java.nio.charset.*;
import java.util.*;
import java.util.stream.*;

import static io.fairspace.saturn.config.ViewsConfig.*;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static java.lang.String.format;
import static java.util.stream.Collectors.toList;

@Slf4j
public class ViewService {
    private final ViewsConfig searchConfig;
    private final Dataset ds;
    private final DavFactory davFactory;
    private final CollectionResource rootSubject;

    public ViewService(ViewsConfig viewsConfig, Dataset ds, DavFactory davFactory) {
        this.searchConfig = viewsConfig;
        this.ds = ds;
        this.davFactory = davFactory;
        this.rootSubject = davFactory.root;
    }

    private List<ValueDTO> getColumnValues(View view, View.Column column) {
        if (!EnumSet.of(ColumnType.Term, ColumnType.TermSet).contains(column.type)) {
            return null;
        }
        if (view.name.equalsIgnoreCase("Collection") && column.name.equalsIgnoreCase("type")) {
            return Txn.calculateRead(ds, () -> view.types.stream()
                    .map(type -> {
                        var resource = ds.getDefaultModel().createResource(type);
                        return new ValueDTO(getStringProperty(resource, RDFS.label), resource.getURI(), null);
                    })
                    .collect(Collectors.toList())
            );
        }

        var query = format("""
                        PREFIX fs: <http://fairspace.io/ontology#>
                        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
                        SELECT ?value ?label
                        WHERE {
                           ?value a <%s> ; rdfs:label ?label .
                           FILTER EXISTS { ?subject <%s> ?value }
                           FILTER NOT EXISTS { ?value fs:dateDeleted ?anyDateDeleted }
                        } ORDER BY ?label
                        """,
                column.rdfType,
                column.source);
        var values = new ArrayList<ValueDTO>();
        try (var execution = QueryExecutionFactory.create(query, ds)) {
            execution.execSelect().forEachRemaining(row -> {
                var resource = row.getResource("value");
                var label = row.getLiteral("label").getString();
                var access = davFactory.isFileSystemResource(resource) ? davFactory.getAccess(resource) : null;
                values.add(new ValueDTO(label, resource.getURI(), access));
            });
        }
        return values;
    }

    public List<FacetDTO> getFacets() {
        return Txn.calculateRead(ds, () -> {
            var facets = searchConfig.views
                    .stream()
                    .flatMap(view ->
                            view.columns.stream()
                                    .map(column -> new FacetDTO(
                                            view.name + "_" + column.name,
                                            column.title,
                                            column.type,
                                            getColumnValues(view, column),
                                            column.min,
                                            column.max))
                                    .filter(f -> f.getMin() != null || f.getMax() != null || (f.getValues() != null && f.getValues().size() > 1))
                    )
                    .collect(toList());
            var rootLocation = rootSubject.getUniqueId() + "/";
            try {
                var collections = rootSubject.getChildren();
                facets.add(new FacetDTO("Collection_collection", "Collection", ColumnType.Term,
                        collections.stream().map(collection -> {
                            var location = collection.getUniqueId().substring(rootLocation.length());
                            var collectionId = location.split("/")[0];
                            var access = davFactory.getAccess(ds.getDefaultModel().getResource(collection.getUniqueId()));
                            return new ValueDTO(URLDecoder.decode(collectionId, StandardCharsets.UTF_8), collection.getUniqueId(), access);
                        }).collect(Collectors.toList()), null, null));
            } catch (NotAuthorizedException | BadRequestException e) {
                log.error("Could not retrieve accessible collections", e);
            }
            return facets;
        });
    }

    private List<View.Column> columnsIncludingCollection(View view) {
        if (view.name.equalsIgnoreCase("Collection")) {
            var result = new ArrayList<>(view.columns);
            var collectionColumn = new View.Column();
            collectionColumn.name = "collection";
            collectionColumn.title = "Collection";
            collectionColumn.type = ColumnType.Text;
            result.add(collectionColumn);
            return result;
        }
        return view.columns;
    }

    public List<ViewDTO> getViews() {
        return searchConfig.views.stream()
                .map(v -> {
                    var columns = new ArrayList<ColumnDTO>();
                    columns.add(new ColumnDTO(v.name, v.itemName == null ? v.name : v.itemName, ColumnType.Identifier));
                    for (var c : columnsIncludingCollection(v)) {
                        columns.add(new ColumnDTO(v.name + "_" + c.name, c.title, c.type));
                    }
                    for (var j : v.join) {
                        var joinView = searchConfig.views.stream().filter(view -> view.name.equalsIgnoreCase(j.view)).findFirst().orElse(null);
                        if (joinView == null) {
                            continue;
                        }
                        if (j.include.contains("id")) {
                            columns.add(new ColumnDTO(joinView.name, joinView.title, ColumnType.Identifier));
                        }
                        for (var c : columnsIncludingCollection(joinView)) {
                            if (!j.include.contains(c.name)) {
                                continue;
                            }
                            columns.add(new ColumnDTO(joinView.name + "_" + c.name, c.title, c.type));
                        }
                    }
                    return new ViewDTO(v.name, v.title, columns);
                })
                .collect(toList());
    }
}
