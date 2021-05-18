package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.log4j.*;
import org.apache.jena.datatypes.xsd.*;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;

import java.util.*;

import static io.fairspace.saturn.config.ViewsConfig.ColumnType;
import static io.fairspace.saturn.config.ViewsConfig.View;
import static java.time.Instant.ofEpochMilli;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.calculateRead;

@Log4j2
public class ViewService {
    private static final Query VALUES_QUERY = QueryFactory.create(String.format("""
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
            """, FS.NS));

    private static final Query RESOURCE_TYPE_VALUES_QUERY = QueryFactory.create(String.format("""
          PREFIX fs: <%s>
          SELECT ?value ?label
          WHERE {
             VALUES (?value ?label) {
                (fs:Collection "Collection")
                (fs:Directory "Directory")
                (fs:File "File")
             }
          }
          """, FS.NS));

    private static final Query BOUNDS_QUERY = QueryFactory.create(String.format("""
            PREFIX fs: <%s>

            SELECT (MIN(?value) AS ?min) (MAX(?value) AS ?max)
            WHERE {
               ?subject ?predicate ?value
               FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
            }
            """, FS.NS));


    private final ViewsConfig searchConfig;
    private final Dataset ds;

    public ViewService(ViewsConfig viewsConfig, Dataset ds) {
        this.searchConfig = viewsConfig;
        this.ds = ds;
    }

    private Object convertLiteralValue(Object value) {
        if (value instanceof XSDDateTime) {
            return ofEpochMilli(((XSDDateTime) value).asCalendar().getTimeInMillis());
        }
        return value;
    }

    private FacetDTO getFacetInfo(View view, View.Column column) {
        List<ValueDTO> values = null;
        Object min = null;
        Object max = null;

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
            case Number, Date -> {
                var binding = new QuerySolutionMap();
                binding.add("predicate", createResource(column.source));

                try (var execution = QueryExecutionFactory.create(BOUNDS_QUERY, ds, binding)) {
                    var row = execution.execSelect().next();
                    min = ofNullable(row.getLiteral("min")).map(Literal::getValue).map(this::convertLiteralValue).orElse(null);
                    max = ofNullable(row.getLiteral("max")).map(Literal::getValue).map(this::convertLiteralValue).orElse(null);
                }
            }
        }

        return new FacetDTO(view.name + "_" + column.name, column.title, column.type, values, min, max);
    }

    public List<FacetDTO> getFacets() {
        return calculateRead(ds, () -> searchConfig.views
                .stream()
                .flatMap(view ->
                        view.columns.stream()
                                .map(column -> getFacetInfo(view, column))
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
