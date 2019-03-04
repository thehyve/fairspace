package io.fairspace.saturn.rdf;

import org.apache.commons.io.IOUtils;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.apache.jena.iri.IRI;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.RDFNode;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.Calendar;
import java.util.concurrent.ConcurrentHashMap;

import static java.util.UUID.randomUUID;
import static org.apache.commons.lang.StringUtils.replace;


public class SparqlUtils {
    private static String workspaceURI;
    private static final ConcurrentHashMap<String, String> storedQueries = new ConcurrentHashMap<>();
    private static final String questionMarkReplacement = randomUUID().toString();
    private static final String dollarSignReplacement = randomUUID().toString();

    public static String formatQuery(String template, Object... args) {
        // TODO: Replace ParameterizedSparqlString with a more reliable implementation, doing proper escaping of literals an URIs
        var sparql = new ParameterizedSparqlString(template);

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg == null) {
                continue;
            }

            var param = Integer.toString(i);

            if (arg instanceof RDFNode) {
                sparql.setParam(param, (RDFNode) arg);
            } else if (arg instanceof Node) {
                sparql.setParam(param, (Node) arg);
            } else if (arg instanceof String) {
                sparql.setLiteral(param, escape((String) arg));
            } else if (arg instanceof IRI) {
                sparql.setIri(param, (IRI) arg);
            } else if (arg instanceof URL) {
                sparql.setIri(param, (URL) arg);
            } else if (arg instanceof Boolean) {
                sparql.setLiteral(param, (Boolean) arg);
            } else if (arg instanceof Long) {
                sparql.setLiteral(param, (Long) arg);
            } else if (arg instanceof Integer) {
                sparql.setLiteral(param, (Integer) arg);
            } else if (arg instanceof Float) {
                sparql.setLiteral(param, (Float) arg);
            } else if (arg instanceof Double) {
                sparql.setLiteral(param, (Double) arg);
            } else if (arg instanceof Calendar) {
                sparql.setLiteral(param, (Calendar) arg);
            } else {
                throw new IllegalArgumentException();
            }
        }

        sparql.setNsPrefix("ws", workspaceURI);

        return unescape(sparql.toString());
    }

    public static String storedQuery(String name, Object... args) {
        var template = storedQueries.computeIfAbsent(name, SparqlUtils::load);
        return formatQuery(template, args);
    }

    private static String load(String name) {
        try {
            return IOUtils.toString(SparqlUtils.class.getResourceAsStream("/sparql/" + name + ".sparql"), "UTF-8");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static String getWorkspaceURI() {
        return workspaceURI;
    }

    public static void setWorkspaceURI(String workspaceURI) {
        SparqlUtils.workspaceURI = workspaceURI;
    }

    public static Instant parseXSDDateTime(Literal literal) {
        return Instant.ofEpochMilli(((XSDDateTime) literal.getValue()).asCalendar().getTimeInMillis());
    }

    // Replaces ? and $ symbols with unique character sequences
    // That should have been done by ParameterizedSparqlString, but it only performs security checks.
    private static String escape(String s) {
        return replace(replace(s, "?", questionMarkReplacement), "$", dollarSignReplacement);
    }

    // Restores ? and $
    private static String unescape(String s) {
        return replace(replace(s, questionMarkReplacement, "?"), dollarSignReplacement, "$");
    }
}
