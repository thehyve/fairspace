package io.fairspace.saturn.rdf;

import org.apache.commons.io.IOUtils;
import org.apache.jena.graph.Node;
import org.apache.jena.iri.IRI;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.RDFNode;


import java.io.IOException;
import java.net.URL;
import java.util.Calendar;
import java.util.concurrent.ConcurrentHashMap;


public class StoredQueries {
    private static final ConcurrentHashMap<String, String> queries = new ConcurrentHashMap<>();

    public static String storedQuery(String name, Object... args) {
        var template = queries.computeIfAbsent(name, StoredQueries::load);
        var sparql = new ParameterizedSparqlString(template);

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];

            if (arg instanceof RDFNode) {
                sparql.setParam(i, (RDFNode) arg);
            } else if (arg instanceof Node) {
                sparql.setParam(i, (Node) arg);
            } else if (arg instanceof String) {
                sparql.setLiteral(i, (String) arg);
            } if (arg instanceof IRI) {
                sparql.setIri(i, (IRI) arg);
            } else if (arg instanceof URL) {
                sparql.setIri(i, (URL) arg);
            } else if (arg instanceof Boolean) {
                sparql.setLiteral(i, (Boolean) arg);
            } else if (arg instanceof Long) {
                sparql.setLiteral(i, (Long) arg);
            } else if (arg instanceof Integer) {
                sparql.setLiteral(i, (Integer) arg);
            } else if (arg instanceof Float) {
                sparql.setLiteral(i, (Float) arg);
            } else if (arg instanceof Double) {
                sparql.setLiteral(i, (Double) arg);
            } else if (arg instanceof Calendar) {
                sparql.setLiteral(i, (Calendar) arg);
            } else {
                throw new IllegalArgumentException();
            }
        }

        return sparql.toString();
    }

    private static String load(String name) {
        try {
            return IOUtils.toString(StoredQueries.class.getResourceAsStream("/sparql/" + name + ".sparql"), "UTF-8");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
