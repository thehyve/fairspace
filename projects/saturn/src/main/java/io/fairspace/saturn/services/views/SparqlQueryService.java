package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.config.ViewsConfig.ColumnType;
import io.fairspace.saturn.config.ViewsConfig.View;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.sparql.expr.*;
import org.apache.jena.sparql.syntax.ElementFilter;
import org.apache.jena.vocabulary.RDFS;

import java.time.*;
import java.util.*;

import static io.fairspace.saturn.rdf.ModelUtils.getResourceProperties;
import static java.time.Instant.ofEpochMilli;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.*;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.sparql.expr.NodeValue.*;
import static org.apache.jena.system.Txn.calculateRead;

@Slf4j
public class SparqlQueryService implements QueryService {
    private static final String RESOURCES_VIEW = "Resource";
    private final Config.Search config;
    private final ViewsConfig searchConfig;
    private final Dataset ds;

    public SparqlQueryService(Config.Search config, ViewsConfig viewsConfig, Dataset ds) {
        this.config = config;
        this.searchConfig = viewsConfig;
        this.ds = ds;
    }

    public ViewPageDTO retrieveViewPage(ViewRequest request) {
        var query = getQuery(request);

        log.debug("Executing query:\n{}", query);

        var page = (request.getPage() != null && request.getPage() >= 1) ? request.getPage() : 1;
        var size = (request.getSize() != null && request.getSize() >= 1) ? request.getSize() : 20;
        query.setLimit(size + 1);
        query.setOffset((page - 1) * size);

        log.debug("Query with filters and pagination applied: \n{}", query);

        var selectExecution = QueryExecutionFactory.create(query, ds);
        selectExecution.setTimeout(config.pageRequestTimeout);

        return calculateRead(ds, () -> {
            var iris = new ArrayList<Resource>();
            var timeout = false;
            var hasNext = false;
            try (selectExecution) {
                var rs = selectExecution.execSelect();
                rs.forEachRemaining(row -> iris.add(row.getResource(request.getView())));
            } catch (QueryCancelledException e) {
                timeout = true;
            }
            while (iris.size() > size) {
                iris.remove(iris.size() - 1);
                hasNext = true;
            }

            var rows = iris.stream()
                    .map(resource -> fetch(resource, request.getView()))
                    .collect(toList());

            return ViewPageDTO.builder()
                    .rows(rows)
                    .hasNext(hasNext)
                    .timeout(timeout)
                    .build();
        });
    }

    private Map<String, Set<ValueDTO>> fetch(Resource resource, String viewName) {
        var view = getView(viewName);

        var result = new HashMap<String, Set<ValueDTO>>();
        result.put(view.name, Set.of(toValueDTO(resource)));

        for (var c : view.columns) {
            result.put(viewName + "_" + c.name, getValues(resource, c));
        }
        for (var j : view.join) {
            var joinView = getView(j.view);

            var prop = createProperty(j.on);
            var refs = j.reverse
                    ? resource.getModel().listResourcesWithProperty(prop, resource).toList()
                    : getResourceProperties(resource, prop);

            for (var colName : j.include) {
                if (colName.equals("id")) {
                    result.put(joinView.name, refs.stream().map(this::toValueDTO).collect(toSet()));
                } else {
                    var col = joinView.columns.stream()
                            .filter(c -> c.name.equals(colName))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Unknown column: " + colName));

                    var values = refs.stream()
                            .flatMap(ref -> getValues(ref, col)
                                    .stream()).
                                    collect(toCollection(TreeSet::new));

                    result.put(joinView.name + "_" + colName, values);
                }
            }
        }

        return result;
    }

    private Set<ValueDTO> getValues(Resource resource, View.Column column) {
        return new TreeSet<>(resource.listProperties(createProperty(column.source))
                .mapWith(Statement::getObject)
                .mapWith(this::toValueDTO)
                .toSet());
    }

    private View getView(String viewName) {
        return searchConfig.views
                .stream()
                .filter(v -> v.name.equals(viewName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown view: " + viewName));
    }

    private ValueDTO toValueDTO(RDFNode node) {
        if (node.isLiteral()) {
            var value = node.asLiteral().getValue();
            if (value instanceof XSDDateTime) {
                value = ofEpochMilli(((XSDDateTime) value).asCalendar().getTimeInMillis());
            }
            return new ValueDTO(value.toString(), value);
        }
        var resource = node.asResource();
        var label = resource.listProperties(RDFS.label)
                .nextOptional()
                .map(Statement::getString)
                .orElseGet(resource::getLocalName);

        return new ValueDTO(label, resource.getURI());
    }

    private Query getQuery(CountRequest request) {
        var view = getView(request.getView());

        var builder = new StringBuilder("PREFIX fs: <http://fairspace.io/ontology#>\n\nSELECT ?")
                .append(view.name)
                .append("\nWHERE {\n");

        if (request.getFilters() != null) {
            var filters = new ArrayList<>(request.getFilters());

            filters.stream()
                    .filter(f -> f.field.equals("location"))
                    .findFirst()
                    .ifPresent(locationFilter -> {
                filters.remove(locationFilter);

                if (locationFilter.values != null && !locationFilter.values.isEmpty()) {
                    var fileLink = view.join.stream().filter(v -> v.view.equals(RESOURCES_VIEW))
                            .findFirst().orElse(null);
                    if (fileLink != null) {
                        builder.append("FILTER EXISTS {\n")
                                .append("?file fs:belongsTo* ?location .\n FILTER (?location IN (")
                                .append(locationFilter.values.stream().map(v -> "<" + v + ">").collect(joining(", ")))
                                .append("))\n ?file <")
                                .append(fileLink.on)
                                .append("> ?")
                                .append(view.name)
                                .append(" . \n")
                                .append("}\n");
                    } else {
                        builder.append("?").append(view.name)
                                .append(" fs:belongsTo* ?location .\n FILTER (?location IN (")
                                .append(locationFilter.values.stream().map(v -> "<" + v + ">").collect(joining(", ")))
                                .append("))\n");
                    }
                }
            });

            filters.stream()
                    .map(f -> f.field)
                    .sorted(comparing(field -> field.contains("_") ? getColumn(field).priority : 0))
                    .map(field -> field.split("_")[0])
                    .distinct()
                    .forEach(entity -> {
                        if (!entity.equals(view.name)) {
                            builder.append("FILTER EXISTS {\n");

                            var join = view.join
                                    .stream()
                                    .filter(j -> j.view.equals(entity))
                                    .findFirst()
                                    .orElseThrow(() -> new RuntimeException("Unknown view: " + entity));

                            builder.append("?")
                                    .append(view.name)
                                    .append(join.reverse ? " ^<" : " <")
                                    .append(join.on)
                                    .append("> ?")
                                    .append(join.view)
                                    .append(" .\n");
                        }

                        request.getFilters()
                                .stream()
                                .filter(f -> f.getField().startsWith(entity + "_"))
                                .sorted(comparing(f -> getColumn(f.field).priority))
                                .forEach(f -> {
                                    var condition = toFilterString(f);
                                    if (condition != null) {
                                        if (!f.getField().equals(entity)) {
                                            builder.append("?")
                                                    .append(entity)
                                                    .append(" <")
                                                    .append(getColumn(f.field).source)
                                                    .append("> ?")
                                                    .append(f.field)
                                                    .append(" .\n");
                                        }
                                        builder.append(condition)
                                                .append(" \n");
                                    }
                                });
                        if (!entity.equals(view.name)) {
                            builder.append("}");
                        }
                        builder.append("\n");
                    });
        }

        builder.append("?")
                .append(view.name)
                .append(" a ?type .\nFILTER (?type IN (")
                .append(view.types.stream().map(t -> "<" + t + ">").collect(joining(", ")))
                .append("))\nFILTER NOT EXISTS { ?")
                .append(view.name)
                .append(" fs:dateDeleted ?any }\n}");

        return QueryFactory.create(builder.toString());
    }

    private String toFilterString(ViewFilter filter) {
        var type = getColumn(filter.field).type;

        var variable = new ExprVar(filter.field);
        Expr expr;
        if (filter.min != null && filter.max != null) {
            expr = new E_LogicalAnd(new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, type)), new E_LessThanOrEqual(variable, toNodeValue(filter.max, type)));
        } else if (filter.min != null) {
            expr = new E_GreaterThanOrEqual(variable, toNodeValue(filter.min, type));
        } else if (filter.max != null) {
            expr = new E_LessThanOrEqual(variable, toNodeValue(filter.max, type));
        } else if (filter.values != null && !filter.values.isEmpty()) {
            List<Expr> values = filter.values.stream()
                    .map(o -> toNodeValue(o, type))
                    .collect(toList());
            expr = new E_OneOf(variable, new ExprList(values));
        } else if (filter.prefix != null && !filter.prefix.isEmpty()) {
            expr = new E_StrStartsWith(new E_Str(variable), makeString(filter.prefix));
        } else {
            return null;
        }

        return new ElementFilter(expr).toString();
    }

    private View.Column getColumn(String name) {
        var fieldNameParts = name.split("_");
        if (fieldNameParts.length != 2) {
            throw new IllegalArgumentException("Invalid field: " + name);
        }
        var viewConfig = getView(fieldNameParts[0]);
        return viewConfig.columns.stream()
                .filter(column -> column.name.equalsIgnoreCase(fieldNameParts[1]))
                .findFirst().orElseThrow(() -> {
                    log.error("Unknown column for view {}: {}", fieldNameParts[0], fieldNameParts[1]);
                    log.error("Expected one of {}", viewConfig.columns.stream().map(column -> column.name).collect(joining(", ")));
                    throw new IllegalArgumentException(
                            "Unknown column for view " + fieldNameParts[0] + ": " + fieldNameParts[1]);
                });
    }

    private static Calendar convertDateValue(String value) {
        var calendar = Calendar.getInstance();
        calendar.setTimeInMillis(Instant.parse(value).toEpochMilli());
        return calendar;
    }

    private static NodeValue toNodeValue(Object o, ColumnType type) {
        return switch (type) {
            case Identifier, Term, TermSet -> makeNode(createURI(o.toString()));
            case Text, Set -> makeString(o.toString());
            case Number -> makeDecimal(o.toString());
            case Date -> makeDateTime(convertDateValue(o.toString()));
        };
    }

    public CountDTO count(CountRequest request) {
        var query = getQuery(request);

        log.debug("Querying the total number of matches: \n{}", query);

        var execution = QueryExecutionFactory.create(query, ds);
        execution.setTimeout(config.countRequestTimeout);

        return calculateRead(ds, () -> {
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
