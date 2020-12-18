package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.webdav.*;
import lombok.extern.slf4j.*;
import org.apache.jena.query.*;
import org.apache.jena.system.Txn;
import org.apache.jena.vocabulary.RDFS;

import java.util.*;
import java.util.stream.*;

import static io.fairspace.saturn.config.ViewsConfig.*;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

@Slf4j
public class ViewService {
    private static final Query VALUES_QUERY = QueryFactory.create("""
            PREFIX fs: <http://fairspace.io/ontology#>
            PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?value ?label
            WHERE {
               ?value a ?type ; rdfs:label ?label .
               FILTER EXISTS { ?subject ?predicate ?value }
               FILTER NOT EXISTS { ?value fs:dateDeleted ?anyDateDeleted }
            } ORDER BY ?label
            """);

    private final ViewsConfig searchConfig;
    private final Dataset ds;
    private final DavFactory davFactory;

    public ViewService(ViewsConfig viewsConfig, Dataset ds, DavFactory davFactory) {
        this.searchConfig = viewsConfig;
        this.ds = ds;
        this.davFactory = davFactory;
    }

    private List<ValueDTO> getColumnValues(View view, View.Column column) {
        if (column.type != ColumnType.Term && column.type != ColumnType.TermSet) {
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

        var binding = new QuerySolutionMap();
        binding.add("type", createResource(column.rdfType));
        binding.add("predicate", createResource(column.source));
        var values = new ArrayList<ValueDTO>();
        try (var execution = QueryExecutionFactory.create(VALUES_QUERY, ds, binding)) {
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
        return Txn.calculateRead(ds, () -> searchConfig.views
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
                .collect(toList()));
    }

    public List<ViewDTO> getViews() {
        return searchConfig.views.stream()
                .map(v -> {
                    var columns = new ArrayList<ColumnDTO>();
                    columns.add(new ColumnDTO(v.name, v.itemName == null ? v.name : v.itemName, ColumnType.Identifier));
                    for (var c : v.columns) {
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
                        for (var c : joinView.columns) {
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
