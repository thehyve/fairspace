package io.fairspace.saturn.services.views;

import freemarker.template.*;
import io.fairspace.saturn.config.*;
import io.fairspace.saturn.config.ViewsConfig.*;
import io.fairspace.saturn.webdav.*;
import lombok.extern.slf4j.*;
import org.apache.jena.datatypes.xsd.*;
import org.apache.jena.graph.*;
import org.apache.jena.query.*;
import org.apache.jena.sparql.expr.*;
import org.apache.jena.sparql.syntax.*;
import org.apache.jena.system.*;
import org.apache.jena.vocabulary.*;

import java.io.*;
import java.util.*;
import java.util.stream.*;

import static freemarker.template.Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS;
import static io.fairspace.saturn.rdf.ModelUtils.*;
import static java.lang.String.join;
import static java.time.Instant.*;
import static java.util.stream.Collectors.*;

@Slf4j
public class SparqlQueryService implements QueryService {
    private final Config.Search config;
    private final ViewsConfig searchConfig;
    private final Dataset ds;
    private final DavFactory davFactory;
    private final Configuration freemakerConfig = new Configuration(DEFAULT_INCOMPATIBLE_IMPROVEMENTS);

    public SparqlQueryService(Config.Search config, ViewsConfig viewsConfig, Dataset ds, DavFactory davFactory) {
        this.config = config;
        this.searchConfig = viewsConfig;
        this.ds = ds;
        this.davFactory = davFactory;

        try {
            freemakerConfig.setDirectoryForTemplateLoading(new File("./templates"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public ViewPageDTO retrieveViewPage(ViewRequest request) {
        var selectQuery = getQuery(request.getView(), getFiltersModel(request.getFilters()));

        var page = (request.getPage() != null && request.getPage() >= 1) ? request.getPage() : 1;
        var size = (request.getSize() != null && request.getSize() >= 1) ? request.getSize() : 20;
        selectQuery.setLimit(size + 1);
        selectQuery.setOffset((page - 1) * size);

        log.debug("Query with filters and pagination applied: \n{}", selectQuery);

        var selectExecution = QueryExecutionFactory.create(selectQuery, ds);
        selectExecution.setTimeout(config.pageRequestTimeout);

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

            return ViewPageDTO.builder()
                    .rows(rows)
                    .hasNext(hasNext)
                    .timeout(timeout)
                    .build();
        });
    }

    private Query getQuery(String view, Object model) {
        try {
            var template = freemakerConfig.getTemplate(view + ".sparql.ftl");
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
                var resource = value.asResource();
                map.put(name, resource.getURI());
                var label = getStringProperty(resource, RDFS.label);
                if (label != null) {
                    map.put(name + ".label", label);
                }
                if (davFactory.isFileSystemResource(resource)) {
                    map.put(name + ".access", davFactory.getAccess(resource));
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
        if (filters != null) {
            for (var filter: filters) {
                model.put(filter.field, toFilterString(filter));
            }
        }
        return model;
    }

    private String toFilterString(ViewFilter filter) {
        var column = getColumn(filter.field);

        var variable = new ExprVar(filter.field);
        Expr expr;
        if (filter.min != null && filter.max != null) {
            expr = new E_LogicalAnd(new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, column.type)), new E_LessThanOrEqual(variable, toNodeValue(filter.max, column.type)));
        } else if (filter.min != null) {
            expr = new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, column.type));
        } else if (filter.max != null) {
            expr = new E_LessThanOrEqual(variable, toNodeValue(filter.max, column.type));
        } else if (filter.values != null && !filter.values.isEmpty()) {
            List<Expr> values = filter.values.stream()
                    .map(o -> toNodeValue(o, column.type))
                    .collect(toList());
            expr = new E_OneOf(variable, new ExprList(values));
        } else if (filter.prefix != null && !filter.prefix.isEmpty()) {
            expr = new E_StrStartsWith(new E_Str(variable), NodeValue.makeString(filter.prefix));
        } else {
            return null;
        }

        return new ElementFilter(expr).toString();
    }

    private View.Column getColumn(String name) {
        if (name.equalsIgnoreCase("Collection")) {
            var column = new View.Column();
            column.name = "Collection";
            column.type = ColumnType.Identifier;
            return column;
        }
        var fieldNameParts = name.split("_");
        if (fieldNameParts.length != 2) {
            throw new IllegalArgumentException("Invalid field: " + name);
        }
        var viewConfig = searchConfig.views.stream().filter(
                view -> view.name.equalsIgnoreCase(fieldNameParts[0])
        ).findFirst().orElseThrow(() -> {
            throw new IllegalArgumentException("Unknown view name: " + fieldNameParts[0]);
        });
        if (name.equalsIgnoreCase("Collection_collection")) {
            var column = new View.Column();
            column.name = "Collection_collection";
            column.type = ColumnType.Term;
            return column;
        }
        return viewConfig.columns.stream()
                .filter(column -> column.name.equalsIgnoreCase(fieldNameParts[1]))
                .findFirst().orElseThrow(() -> {
            log.error("Unknown column for view {}: {}", fieldNameParts[0], fieldNameParts[1]);
            log.error("Expected one of {}", viewConfig.columns.stream().map(column -> column.name).collect(Collectors.joining(", ")));
            throw new IllegalArgumentException(
                    "Unknown column for view " + fieldNameParts[0] + ": " + fieldNameParts[1]);
        });
    }

    private static NodeValue toNodeValue(Object o, ColumnType type) {
        return switch (type) {
            case Identifier, Term, TermSet -> NodeValue.makeNode(NodeFactory.createURI(o.toString()));
            case Text, Set -> NodeValue.makeString(o.toString());
            case Number -> NodeValue.makeDecimal(o.toString());
            case Date -> NodeValue.makeDate(o.toString());
        };
    }

    public CountDTO count(CountRequest request) {
        var query = getQuery(request.getView(), getFiltersModel(request.getFilters()));

        log.debug("Querying the total number of matches: \n{}", query);

        var execution = QueryExecutionFactory.create(query, ds);
        execution.setTimeout(config.countRequestTimeout);

        return Txn.calculateRead(ds, () -> {
            long count = 0;
            try (execution) {
                for (var it = execution.execSelect(); it.hasNext(); it.next()) {
                    count++;
                }
                return new CountDTO(count, false);
            } catch (QueryCancelledException e) {
                return new CountDTO(count, true);
            }
        });
    }
}
