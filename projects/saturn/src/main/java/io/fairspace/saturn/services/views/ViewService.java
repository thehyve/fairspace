package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.transactions.Transactions;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryCancelledException;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.expr.*;
import org.apache.jena.sparql.expr.aggregate.AggCount;
import org.apache.jena.sparql.syntax.ElementFilter;
import org.apache.jena.sparql.syntax.ElementGroup;
import org.apache.jena.sparql.syntax.ElementSubQuery;
import org.apache.jena.vocabulary.RDFS;

import java.util.HashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;

@Slf4j
public class ViewService {
    private static final long FIRST_RESULT_TIMEOUT = 30;
    private static final long QUERY_EXECUTION_TIMEOUT = 60;
    private static final int MAX_RESULTS = 100_000;

    private final Transactions transactions;

    private final Config.Search config;

    public ViewService(Config.Search config, Transactions transactions) {
        this.config = config;
        this.transactions = transactions;
    }

    public ViewPage retrieveViewPage(ViewRequest request) {
        var view = config.views
                .stream()
                .filter(v -> v.name.equals(request.view))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown view: " + request.view));

        var query = QueryFactory.create(view.query);

        log.debug("Original query: \n{}", query);

        var page = (request.page != null && request.page >= 1) ? request.page : 1;
        var size = (request.size != null && request.size >= 1) ? request.size : 20;
        query.setLimit(size);
        query.setOffset((page - 1) * size);

        if (!(query.getQueryPattern() instanceof ElementGroup)) {
            var group = new ElementGroup();
            group.addElement(query.getQueryPattern());
            query.setQueryPattern(group);
        }

        var queryPatternGroup = (ElementGroup) query.getQueryPattern();

        request.filters.forEach(filter -> {
            var facet = config.facets
                    .stream()
                    .filter(f -> f.name.equals(filter.field))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown facet: " + filter.field));

            var variable = new ExprVar(filter.field);
            if (!filter.values.isEmpty()) {
                if (filter.getValues().size() == 1) {
                    queryPatternGroup.addElementFilter(new ElementFilter(new E_Equals(variable, toNodeValue(filter.values.get(0), facet.type))));
                } else {
                    queryPatternGroup.addElementFilter(new ElementFilter(new E_OneOf(variable, new ExprList(filter.values.stream().map(o -> toNodeValue(o, facet.type)).collect(toList())))));
                }
            }
            if (filter.rangeStart != null) {
                queryPatternGroup.addElementFilter(new ElementFilter(new E_GreaterThanOrEqual(variable, toNodeValue(filter.rangeStart, facet.type))));
            }
            if (filter.rangeEnd != null) {
                queryPatternGroup.addElementFilter(new ElementFilter(new E_LessThanOrEqual(variable, toNodeValue(filter.rangeEnd, facet.type))));
            }
        });

        log.debug("Query with filters and pagination applied: \n{}", query);

        return transactions.calculateRead(m -> {
            var result = ViewPage.builder();

            try (var execution = QueryExecutionFactory.create(query, m)) {
                execution.setTimeout(FIRST_RESULT_TIMEOUT, TimeUnit.SECONDS, QUERY_EXECUTION_TIMEOUT, TimeUnit.SECONDS);
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
                            result.row(map);
                        });
            } catch (QueryCancelledException e) {
                log.error("Query has been cancelled due to timeout: \n{}", query);
            }

            result.size((int) query.getLimit());
            result.page((int) (query.getOffset() / query.getLimit()) + 1);

            query.setLimit(MAX_RESULTS);
            query.setOffset(0);

            var queryTotal  = new Query();
            queryTotal.setQuerySelectType();
            var project = queryTotal.getProject();

            var aggregatorExpr = queryTotal.allocAggregate(new AggCount());
            project.add(Var.alloc("total"), aggregatorExpr);
            queryTotal.setQueryPattern(new ElementSubQuery(query));

            log.debug("Querying the total number of matches: \n{}", queryTotal);

            var total = (int) query.getLimit();

            try (var execution = QueryExecutionFactory.create(queryTotal, m)) {
                execution.setTimeout(QUERY_EXECUTION_TIMEOUT, TimeUnit.SECONDS);
                total = execution.execSelect().next().get("total").asLiteral().getInt();
            } catch (QueryCancelledException e) {
                log.error("Query has been cancelled due to timeout: \n{}", queryTotal);
            }

            return result
                    .page(page)
                    .size(size)
                    .totalElements(total)
                    .totalPages((total / size) + ((total % size > 0) ? 1 : 0))
                    .build();
        });
    }

    private static NodeValue toNodeValue(Object o, Config.Search.ValueType type) {
        return switch (type) {
            case id -> NodeValue.makeNode(NodeFactory.createURI(o.toString()));
            case text -> NodeValue.makeString(o.toString());
            case number -> NodeValue.makeDecimal(o.toString());
            case date -> NodeValue.makeDate(o.toString());
        };
    }

    public List<FacetDTO> getFacets() {
        return config.facets
                .stream()
                .map(f -> new FacetDTO(f.name, f.title, f.type))
                .collect(toList());
    }

    public List<ViewDTO> getViews() {
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
