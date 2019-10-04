package io.fairspace.saturn.rdf;

import lombok.NonNull;
import lombok.SneakyThrows;
import org.apache.commons.io.IOUtils;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.RDFList;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.lang.String.format;
import static java.util.UUID.randomUUID;
import static java.util.stream.Collectors.joining;
import static org.apache.jena.graph.NodeFactory.createLiteral;
import static org.apache.jena.graph.NodeFactory.createURI;
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

            if(arg == null) {
                param = "?" + i;
            } else if(arg instanceof Collection) {
                param = ((Collection<?>) arg).stream()
                        .filter(Objects::nonNull)
                        .map(SparqlUtils::toSerializableNode)
                        .map(SparqlUtils::toString)
                        .collect(joining(" "));
            } else if(arg instanceof RDFList) {
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
        if (value instanceof Node && ((Node)value).isURI()) {
            validateIRI(((Node) value).getURI());
        }

        return toNode(value);
    }

    @SneakyThrows(IOException.class)
    private static String load(String name) {
        return "PREFIX ws: " + str(createURI(CONFIG.jena.metadataBaseIRI)) + '\n' +
               "PREFIX vocabulary: " + str(createURI(CONFIG.jena.vocabularyBaseIRI)) + '\n' +
                IOUtils.toString(SparqlUtils.class.getResourceAsStream("/sparql/" + name + ".sparql"), "UTF-8");
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

    public static <T> List<T> select(RDFConnection rdf, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new ArrayList<T>();
        rdf.querySelect(query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Set<T> selectDistinct(RDFConnection rdf, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new HashSet<T>();
        rdf.querySelect(query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Optional<T> selectSingle(RDFConnection rdf, String query, Function<QuerySolution, T> valueExtractor) {
        var values = selectDistinct(rdf, query, valueExtractor);
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
}
