package io.fairspace.saturn.services.views;

import freemarker.template.Template;
import freemarker.template.TemplateException;
import io.fairspace.saturn.config.Config;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.*;
import org.apache.jena.sparql.expr.*;
import org.apache.jena.sparql.syntax.ElementFilter;
import org.apache.jena.system.Txn;
import org.apache.jena.vocabulary.RDFS;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.CancellationException;

import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static java.lang.String.join;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.expr.NodeValue.*;

@Slf4j
public class ViewService {
    private final Config.Search config;
    private final Dataset ds;
    private final Map<String, Template> templates = new HashMap<>();

    public ViewService(Config.Search config, Dataset ds) {
        this.config = config;
        this.ds = ds;

        config.views.forEach(view -> {
            try {
                templates.put(view.name,  new Template(view.name, new StringReader(view.query), null));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public Cancellable<ViewPageDto> retrieveViewPage(ViewRequest request) {
        var selectQuery = getQuery(request.getView(), getFiltersModel(request.getFilters()));

        var page = (request.getPage() != null && request.getPage() >= 1) ? request.getPage() : 1;
        var size = (request.getSize() != null && request.getSize() >= 1) ? request.getSize() : 20;
        selectQuery.setLimit(size + 1);
        selectQuery.setOffset((page - 1) * size);

        log.debug("Query with filters and pagination applied: \n{}", selectQuery);

        var selectExecution = QueryExecutionFactory.create(selectQuery, ds);
        selectExecution.setTimeout(config.pageRequestTimeout);

        return new Cancellable<>() {
            @Override
            public void cancel() {
                if (!selectExecution.isClosed()) {
                    selectExecution.abort();
                }
            }

            @Override
            public ViewPageDto get() throws CancellationException {
                return Txn.calculateRead(ds, () -> {
                    var iris = new ArrayList<String>();
                    var rows = new ArrayList<Map<String, Object>>();
                    var timeout = false;
                    var hasNext = false;
                    try (selectExecution) {
                        var rs = selectExecution.execSelect();
                        var variable = rs.getResultVars().get(0);
                        rs.forEachRemaining(row -> iris.add("<" + row.getResource(variable).getURI() + ">"));
                    } catch (QueryCancelledException e) {
                        timeout = true;
                    }
                    while (iris.size() > size) {
                        iris.remove(iris.size() - 1);
                        hasNext = true;
                    }

                    var fetchQuery = getQuery(request.getView(), Map.of("fetch", true, "iris", join(" ", iris)));

                    // Non-cancellable but should be very fast
                    try (var fetchExecution = QueryExecutionFactory.create(fetchQuery, ds)) {
                        fetchExecution.execSelect().forEachRemaining(row -> rows.add(rowToMap(row)));
                    } catch (QueryCancelledException e) {
                        timeout = true;
                    }

                    return new ViewPageDto(rows, hasNext, timeout);
                });
            }
        };
    }

    private Query getQuery(String view, Object model) {
        try {
            var template = templates.get(view);
            var out = new StringWriter();
            try {
                template.process(model, out);
            } catch (TemplateException e) {
                throw new RuntimeException("Error interpolating template: \n " + template, e);
            }
            var sparql = out.toString();
            try {
                return QueryFactory.create(sparql);
            } catch (QueryException e) {
                log.error("Error parsing query:\n {}", sparql);
                throw new RuntimeException("Error parsing query:\n" + sparql, e);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error loading query template for view " + view, e);
        }
    }

    private Map<String, Object> rowToMap(QuerySolution row) {
        var map = new HashMap<String, Object>();
        row.varNames().forEachRemaining(name -> {
            var value = row.get(name);
            if (value.isURIResource()) {
                map.put(name, value.asResource().getURI());
                var label = getStringProperty(value.asResource(), RDFS.label);
                if (label != null) {
                    map.put(name + ".label", label);
                }
            } else if (value.isLiteral()) {
                var literal = value.asLiteral().getValue();
                if (literal instanceof XSDDateTime) {
                    literal = ofEpochMilli(((XSDDateTime) literal).asCalendar().getTimeInMillis());
                }
                map.put(name, literal);
            } else {
                map.put(name, null);
            }
        });
        return map;
    }

    private Map<String, Object> getFiltersModel(List<ViewFilter> filters) {
        var model = new HashMap<String, Object>();
        model.put("fetch", false);
        for (var filter : filters) {
            model.put(filter.field, toFilterString(filter));
        }
        return model;
    }

    private String toFilterString(ViewFilter filter) {
        var facet = getFacet(filter.field);

        var variable = new ExprVar(filter.field);
        Expr expr;
        if (filter.min != null && filter.max != null && !same(filter.min, facet.min) && !same(filter.max, facet.max)) {
            expr = new E_LogicalAnd(new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, facet.type)), new E_LessThanOrEqual(variable, toNodeValue(filter.max, facet.type)));
        } else if (filter.min != null && !same(filter.min, facet.min)) {
            expr = new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, facet.type));
        } else if (filter.max != null && !same(filter.max, facet.max)) {
            expr = new E_LessThanOrEqual(variable, toNodeValue(filter.max, facet.type));
        } else if (filter.values != null && !filter.values.isEmpty()) {
            List<Expr> values = filter.values.stream()
                    .map(o -> toNodeValue(o, facet.type))
                    .collect(toList());
            expr = new E_OneOf(variable, new ExprList(values));
        } else {
            return null;
        }

        return new ElementFilter(expr).toString();
    }

    private static boolean same(Object x, Object y) {
        if (x instanceof Number && y instanceof Number) {
            return ((Number) x).doubleValue() == ((Number) y).doubleValue();
        }
        return Objects.equals(x, y);
    }

    private Config.Search.Facet getFacet(String name) {
        return config.facets
                .stream()
                .filter(f -> f.name.equals(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown facet: " + name));
    }

    private Config.Search.View getView(String viewName) {
        return config.views
                .stream()
                .filter(v -> v.name.equals(viewName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown view: " + viewName));
    }

    private static NodeValue toNodeValue(Object o, Config.Search.ValueType type) {
        return switch (type) {
            case id -> makeNode(createURI(o.toString()));
            case text -> makeString(o.toString());
            case number -> makeDecimal(o.toString());
            case date -> makeDate(o.toString());
        };
    }

    Cancellable<Long> getCount(CountRequest request) {
        var query = getQuery(request.getView(), getFiltersModel(request.getFilters()));

        log.debug("Querying the total number of matches: \n{}", query);

        var execution = QueryExecutionFactory.create(query, ds);
        execution.setTimeout(config.countRequestTimeout);

        return new Cancellable<>() {
            @Override
            public void cancel() {
                if (!execution.isClosed()) {
                    execution.abort();
                }
            }

            @Override
            public Long get() throws CancellationException {
                return Txn.calculateRead(ds, () -> {
                    try (execution) {
                        long count = 0;
                        for(var it = execution.execSelect(); it.hasNext(); it.next()) {
                            count++;
                        }
                        return count;
                    }
                });
            }
        };
    }

    List<FacetDTO> getFacets() {
        return Txn.calculateRead(ds, () ->
                config.facets
                        .stream()
                        .map(f -> new FacetDTO(f.name, f.title, f.type, getValues(f.query), f.min, f.max))
                        .filter(f -> f.getMin() != null || f.getMax() != null || (f.getValues() != null && f.getValues().size() > 1))
                        .collect(toList()));
    }

    private List<ValueDTO> getValues(String query) {
        if (query == null || query.isEmpty()) {
            return null;
        }
        var map = new TreeMap<String, String>();
        try (var execution = QueryExecutionFactory.create(query, ds)) {
            execution.execSelect().forEachRemaining(row -> {
                var resource = row.getResource(row.varNames().next());
                map.put(getStringProperty(resource, RDFS.label), resource.getURI());
            });
        }
        return map.entrySet()
                .stream()
                .map(e -> new ValueDTO(e.getKey(), e.getValue()))
                .collect(toList());
    }

    List<ViewDTO> getViews() {
        return config.views
                .stream()
                .map(v -> new ViewDTO(v.name, v.title,
                        v.columns
                                .stream()
                                .map(c -> new ColumnDTO(c.name, c.title, c.type))
                                .collect(toList())))
                .collect(toList());
    }

    interface Cancellable<T> {
        void cancel();

        T get() throws QueryCancelledException;
    }
}
