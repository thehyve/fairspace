package io.fairspace.saturn.rdf;

import lombok.SneakyThrows;
import org.apache.commons.io.IOUtils;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Literal;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static java.lang.String.format;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createLiteral;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.riot.out.NodeFmtLib.str;
import static org.apache.jena.riot.system.IRIResolver.validateIRI;

public class SparqlUtils {
    private static final ConcurrentHashMap<String, String> storedQueries = new ConcurrentHashMap<>();

    public static String storedQuery(String name, Object... args) {
        var template = storedQueries.computeIfAbsent(name, SparqlUtils::load);
        var params = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg instanceof Node && ((Node)arg).isURI()) {
                validateIRI(((Node) arg).getURI());
            }
            params[i] = arg != null ? toString(arg) : "?" + i;
        }
        return format(template, (Object[]) params);
    }

    @SneakyThrows(IOException.class)
    private static String load(String name) {
        return "PREFIX ws: " + str(createURI(CONFIG.jena.baseIRI)) + '\n' +
                IOUtils.toString(SparqlUtils.class.getResourceAsStream("/sparql/" + name + ".sparql"), "UTF-8");
    }

    public static Node generateIri() {
        return createURI(CONFIG.jena.baseIRI + randomUUID());
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
        if (value instanceof String) {
            return createLiteral((String) value);
        }
        return createTypedLiteral(value instanceof Instant ? toCalendar((Instant) value) : value).asNode();
    }

    private static Calendar toCalendar(Instant value) {
        return GregorianCalendar.from(ZonedDateTime.ofInstant(value, ZoneId.systemDefault()));
    }
}
