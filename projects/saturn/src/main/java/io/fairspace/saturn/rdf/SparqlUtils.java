package io.fairspace.saturn.rdf;

import lombok.NonNull;
import lombok.SneakyThrows;
import org.apache.commons.io.IOUtils;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.function.Function;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.rdf.transactions.Transactions.*;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.lang.String.format;
import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.joining;
import static org.apache.jena.graph.NodeFactory.createLiteral;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.riot.out.NodeFmtLib.str;


public class SparqlUtils {
    private static final ConcurrentHashMap<String, String> storedQueries = new ConcurrentHashMap<>();

    public static String storedQuery(String name, Object... args) {
        var template = storedQueries.computeIfAbsent(name, SparqlUtils::load);
        var params = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            var arg = args[i];
            String param;

            if (arg == null) {
                param = "?" + i;
            } else if (arg instanceof Collection) {
                param = ((Collection<?>) arg).stream()
                        .filter(Objects::nonNull)
                        .map(SparqlUtils::toSerializableNode)
                        .map(SparqlUtils::toString)
                        .collect(joining(" "));
            } else if (arg instanceof RDFList) {
                param = toString((RDFList) arg);
            } else {
                param = toString(toSerializableNode(arg));
            }

            params[i] = param;
        }
        return format(template, (Object[]) params);
    }

    public static String limit(String inputQuery, long limit) {
        return String.format("%s\nLIMIT %d", inputQuery, limit);
    }

    private static Node toSerializableNode(Object value) {
        if (value instanceof Resource) {
            value = ((Resource) value).asNode();
        }
        if (value instanceof Node && ((Node) value).isURI()) {
            validateIRI(((Node) value).getURI());
        }

        return toNode(value);
    }

    @SneakyThrows(IOException.class)
    private static String load(String name) {
        return "PREFIX ws: " + str(createURI(CONFIG.jena.metadataBaseIRI)) + '\n' +
                "PREFIX vocabulary: " + str(createURI(CONFIG.jena.vocabularyBaseIRI)) + '\n' +
                IOUtils.toString(SparqlUtils.class.getResourceAsStream("/sparql/" + name + ".sparql"), StandardCharsets.UTF_8);
    }

    public static Node generateMetadataIri() {
        return generateMetadataIri(randomUUID().toString());
    }

    public static Node generateMetadataIri(String id) {
        return createURI(CONFIG.jena.metadataBaseIRI + id);
    }

    public static String extractIdFromIri(@NonNull Node iri) {
        return iri.getURI().replace(CONFIG.jena.metadataBaseIRI, "");
    }

    public static Node generateVocabularyIri() {
        return generateVocabularyIri(randomUUID().toString());
    }

    public static Node generateVocabularyIri(String id) {
        return createURI(CONFIG.jena.vocabularyBaseIRI + id);
    }

    public static Instant parseXSDDateTimeLiteral(Literal literal) {
        return Instant.ofEpochMilli(((XSDDateTime) literal.getValue()).asCalendar().getTimeInMillis());
    }

    public static Literal toXSDDateTimeLiteral(Instant instant) {
        return createTypedLiteral(GregorianCalendar.from(ZonedDateTime.ofInstant(instant, ZoneId.systemDefault())));
    }

    private static String toString(Object value) {
        return str(toNode(value));
    }

    private static Node toNode(Object value) {
        if (value instanceof Node) {
            return (Node) value;
        }
        if (value instanceof FrontsNode) {
            return ((FrontsNode) value).asNode();
        }
        if (value instanceof String) {
            return createLiteral((String) value);
        }
        return createTypedLiteral(value instanceof Instant ? toCalendar((Instant) value) : value).asNode();
    }

    private static Calendar toCalendar(Instant value) {
        return GregorianCalendar.from(ZonedDateTime.ofInstant(value, ZoneId.systemDefault()));
    }

    public static <T> List<T> select(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new ArrayList<T>();
        querySelect(dataset, query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Set<T> selectDistinct(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new HashSet<T>();
        querySelect(dataset, query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Optional<T> selectSingle(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = selectDistinct(dataset, query, valueExtractor);
        if (values.size() > 1) {
            throw new IllegalStateException("Too many values: " + values.size());
        }
        return values.stream().findFirst();
    }

    public static String toString(RDFList values) {
        return values.asJavaList()
                .stream()
                .map(SparqlUtils::toSerializableNode)
                .map(SparqlUtils::toString)
                .collect(joining(", ", "(", ")"));
    }

    /**
     * Execute a SELECT query and process the ResultSet with the handler code.
     *
     * @param query
     * @param resultSetAction
     */
    public static void queryResultSet(Dataset dataset, String query, Consumer<ResultSet> resultSetAction) {
        executeRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                ResultSet rs = qExec.execSelect();
                resultSetAction.accept(rs);
            }
        });
    }


    /**
     * Execute a SELECT query and process the rows of the results with the handler code.
     *
     * @param query
     * @param rowAction
     */
    public static void querySelect(Dataset dataset, String query, Consumer<QuerySolution> rowAction) {
        executeRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                qExec.execSelect().forEachRemaining(rowAction);
            }
        });
    }

    /**
     * Execute a CONSTRUCT query and return as a Model
     */
    public static Model queryConstruct(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return detachModel(qExec.execConstruct());
            }
        });
    }

    /**
     * Execute a DESCRIBE query and return as a Model
     */
    public static Model queryDescribe(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return detachModel(qExec.execDescribe());
            }
        });
    }

    /**
     * Execute a ASK query and return a boolean
     */
    public static boolean queryAsk(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return qExec.execAsk();
            }
        });
    }

    public static void update(Dataset dataset, String updateString) {
        executeWrite(dataset, () -> UpdateExecutionFactory.create(UpdateFactory.create(updateString), dataset).execute());
    }

    public static Model detachModel(Model m) {
        return createDefaultModel().add(m);
    }

    private static QueryExecution query(Dataset dataset, String query) {
        return QueryExecutionFactory.create(QueryFactory.create(query), dataset);
    }

}
