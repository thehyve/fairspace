package io.fairspace.saturn.rdf;

import org.apache.commons.io.IOUtils;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Literal;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.GregorianCalendar;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static java.lang.String.format;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.riot.system.IRIResolver.validateIRI;
import static org.apache.jena.sparql.util.FmtUtils.stringForNode;
import static org.apache.jena.sparql.util.FmtUtils.stringForString;


public class SparqlUtils {
    private static final ConcurrentHashMap<String, String> storedQueries = new ConcurrentHashMap<>();

    public static String storedQuery(String name, Object... args) {
        var template = storedQueries.computeIfAbsent(name, SparqlUtils::load);
        var params = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            var arg = args[i];
            params[i] = arg != null ? stringify(arg) : "?" + i;
        }
        return format(template, (Object[]) params);
    }

    private static String load(String name) {
        try {
            return "PREFIX ws: " + stringForNode(createURI(CONFIG.jena.baseIRI)) + "\n" +
                    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
            IOUtils.toString(SparqlUtils.class.getResourceAsStream("/sparql/" + name + ".sparql"), "UTF-8");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static Node generateIri() {
        return createURI(CONFIG.jena.baseIRI + randomUUID());
    }

    public static Instant parseXSDDateTime(Literal literal) {
        return Instant.ofEpochMilli(((XSDDateTime) literal.getValue()).asCalendar().getTimeInMillis());
    }

    private static String stringify(Object value) {

        if (value instanceof Node) {
            if (((Node) value).isURI()) {
                validateIRI(((Node) value).getURI());
            }
            return stringForNode((Node)value);
        }
        if (value instanceof String) {
            return stringForString((String) value);
        }
        if (value instanceof Instant) {
            value = GregorianCalendar.from(ZonedDateTime.ofInstant((Instant) value, ZoneId.systemDefault()));
        }

        return stringForNode(createTypedLiteral(value).asNode());
    }
}
