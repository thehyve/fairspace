package io.fairspace.saturn.services.views;

import freemarker.template.Template;
import freemarker.template.TemplateException;
import io.fairspace.saturn.config.Config;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.*;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.expr.*;
import org.apache.jena.sparql.expr.aggregate.AggCount;
import org.apache.jena.sparql.syntax.ElementFilter;
import org.apache.jena.sparql.syntax.ElementSubQuery;
import org.apache.jena.system.Txn;
import org.apache.jena.vocabulary.RDFS;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.*;

import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;

@Slf4j
public class ViewService {
    private final Config.Search config;
    private final Dataset ds;

    public ViewService(Config.Search config, Dataset ds) {
        this.config = config;
        this.ds = ds;
    }

    public ViewPageDto retrieveViewPage(ViewRequest request) {
        var query = getBaseQuery(request.getView(), request.getFilters());
        var page = (request.getPage() != null && request.getPage() >= 1) ? request.getPage() : 1;
        var size = (request.getPage() != null && request.getPage() >= 1) ? request.getSize() : 20;
        query.setLimit(size + 1);
        query.setOffset((page - 1) * size);

        log.debug("Query with filters and pagination applied: \n{}", query);

        return Txn.calculateRead(ds, () -> {
            var rows = new ArrayList<Map<String, Object>>();
            var timeout = false;
            var hasNext = false;

            try (var execution = QueryExecutionFactory.create(query, ds)) {
                execution.setTimeout(config.pageRequestTimeout);
                execution.execSelect()
                        .forEachRemaining(row -> {
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
                            rows.add(map);
                        });
            } catch (QueryCancelledException e) {
                timeout = true;
                log.warn("Query has been cancelled due to timeout: \n{}", query);
            }

            while (rows.size() > size) {
                rows.remove(rows.size() - 1);
                hasNext = true;
            }

            return new ViewPageDto(rows, hasNext, timeout);
        });
    }

    private Query getBaseQuery(String viewName, List<ViewFilter> filters) {
        Template template;
        try {
            template = new Template(viewName, new StringReader(getView(viewName).query), null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        var model = new HashMap<String, String>();
        for (var filter : filters) {
            var facet = config.facets
                    .stream()
                    .filter(f -> f.name.equals(filter.field))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown facet: " + filter.field));

            var variable = new ExprVar(filter.field);
            Expr expr;
            if (filter.rangeStart != null && filter.rangeEnd != null) {
                expr = new E_LogicalAnd(new E_GreaterThanOrEqual(variable, toNodeValue(filter.rangeStart, facet.type)), new E_LessThanOrEqual(variable, toNodeValue(filter.rangeEnd, facet.type)));
            } else {
                List<Expr> values = filter.values.stream()
                        .map(o -> toNodeValue(o, facet.type))
                        .collect(toList());
                expr = new E_OneOf(variable, new ExprList(values));
            }

            model.put(filter.field, new ElementFilter(expr).toString());
        }
        var out = new StringWriter();
        try {
            template.process(model, out);
        } catch (TemplateException | IOException e) {
            throw new RuntimeException(e);
        }
        return QueryFactory.create(out.toString());
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
            case id -> NodeValue.makeNode(NodeFactory.createURI(o.toString()));
            case text -> NodeValue.makeString(o.toString());
            case number -> NodeValue.makeDecimal(o.toString());
            case date -> NodeValue.makeDate(o.toString());
        };
    }

    CountDTO getCount(CountRequest request) {
        var innerQuery = getBaseQuery(request.getView(), request.getFilters());
        var query = toCountQuery(innerQuery);

        log.debug("Querying the total number of matches: \n{}", query);

        return Txn.calculateRead(ds, () -> {
            var total = 0L;
            var timeout = false;
            try (var execution = QueryExecutionFactory.create(query, ds)) {
                execution.setTimeout(config.countRequestTimeout);
                total = execution.execSelect().next().get("total").asLiteral().getInt();
            } catch (QueryCancelledException e) {
                timeout = true;
                log.warn("Query has been cancelled due to timeout: \n{}", query);
            }
            return new CountDTO(total, timeout);
        });
    }

    private Query toCountQuery(Query query) {
        var queryTotal = new Query();
        queryTotal.setQuerySelectType();
        var project = queryTotal.getProject();

        var aggregatorExpr = queryTotal.allocAggregate(new AggCount());
        project.add(Var.alloc("total"), aggregatorExpr);
        queryTotal.setQueryPattern(new ElementSubQuery(query));
        return queryTotal;
    }

    List<FacetDTO> getFacets() {
        return Txn.calculateRead(ds, () ->
                config.facets
                        .stream()
                        .map(f -> new FacetDTO(f.name, f.title, f.type, getValues(f.query), f.min, f.max))
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
}
