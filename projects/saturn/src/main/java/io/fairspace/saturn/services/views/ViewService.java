package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.DavFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.CollectionResource;
import io.milton.resource.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;

import java.util.ArrayList;
import java.util.List;

import static io.fairspace.saturn.config.ViewsConfig.ColumnType;
import static io.fairspace.saturn.config.ViewsConfig.View;
import static java.util.Comparator.comparing;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.calculateRead;

@Slf4j
public class ViewService {
    private static final Query VALUES_QUERY = QueryFactory.create("""
            PREFIX fs: <http://fairspace.io/ontology#>
            PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
                        
            SELECT ?value ?label
            WHERE {
               ?value a ?type ; rdfs:label ?label .
               FILTER EXISTS { ?subject ?predicate ?value }
               FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
               FILTER NOT EXISTS { ?value fs:dateDeleted ?anyDateDeleted }
            } ORDER BY ?label
            """);

    private static final Query BOUNDS_QUERY = QueryFactory.create("""
            PREFIX fs: <http://fairspace.io/ontology#>
                                   
            SELECT (MIN(?value) AS ?min) (MAX(?value) AS ?max)
            WHERE {
               ?subject ?predicate ?value
               FILTER NOT EXISTS { ?subject fs:dateDeleted ?anyDateDeleted }
            }
            """);

    private static final List<ValueDTO> RESOURCE_TYPES = List.of(
            new ValueDTO("Collection", FS.COLLECTION_URI, null),
            new ValueDTO("Directory", FS.DIRECTORY_URI, null),
            new ValueDTO("File", FS.FILE_URI, null));

    private final ViewsConfig searchConfig;
    private final Dataset ds;
    private final DavFactory davFactory;

    public ViewService(ViewsConfig viewsConfig, Dataset ds, DavFactory davFactory) {
        this.searchConfig = viewsConfig;
        this.ds = ds;
        this.davFactory = davFactory;
    }

    private FacetDTO getFacetInfo(View view, View.Column column) {
        List<ValueDTO> values = null;
        Object min = null;
        Object max = null;

        switch (column.type) {
            case Term, TermSet -> {
                if (view.name.equalsIgnoreCase("Collection") && column.name.equalsIgnoreCase("type")) {
                    values = RESOURCE_TYPES;
                } else {
                    var binding = new QuerySolutionMap();
                    binding.add("type", createResource(column.rdfType));
                    binding.add("predicate", createResource(column.source));

                    values = new ArrayList<>();
                    try (var execution = QueryExecutionFactory.create(VALUES_QUERY, ds, binding)) {
                        //noinspection NullableProblems
                        for (var row : (Iterable<QuerySolution>) execution::execSelect) {
                            var resource = row.getResource("value");
                            var label = row.getLiteral("label").getString();
                            var access = davFactory.isFileSystemResource(resource) ? davFactory.getAccess(resource) : null;
                            values.add(new ValueDTO(label, resource.getURI(), access));
                        }
                    }
                }
            }
            case Number -> {
                var binding = new QuerySolutionMap();
                binding.add("predicate", createResource(column.source));

                try (var execution = QueryExecutionFactory.create(BOUNDS_QUERY, ds, binding)) {
                    var row = execution.execSelect().next();
                    min = ofNullable(row.getLiteral("min")).map(Literal::getValue).orElse(null);
                    max = ofNullable(row.getLiteral("max")).map(Literal::getValue).orElse(null);
                }
            }
        }

        return new FacetDTO(view.name + "_" + column.name, column.title, column.type, values, min, max);
    }

    public List<FacetDTO> getFacets() {
        return calculateRead(ds, () -> {
            var facets = searchConfig.views
                    .stream()
                    .flatMap(view ->
                            view.columns.stream()
                                    .map(column -> getFacetInfo(view, column))
                                    .filter(f -> f.getMin() != null || f.getMax() != null || (f.getValues() != null && f.getValues().size() > 1))
                    )
                    .collect(toList());
            try {
                var collections = ((CollectionResource) davFactory.root)
                        .getChildren()
                        .stream()
                        .map(c -> (CollectionResource) c)
                        .sorted(comparing(Resource::getName))
                        .map(c -> new ValueDTO(c.getName(), c.getUniqueId(), davFactory.getAccess(ds.getDefaultModel().createResource(c.getUniqueId()))))
                        .collect(toList());
                facets.add(new FacetDTO("Collection", "Collections", ColumnType.Term, collections, null, null));
            } catch (NotAuthorizedException | BadRequestException e) {
                log.error("Could not retrieve accessible collections", e);
            }
            return facets;
        });
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
