package io.fairspace.saturn.util;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.impl.ModelCom;
import org.apache.jena.sparql.graph.GraphZero;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class ModelUtils {
    public static final Model EMPTY = new ModelCom(GraphZero.instance());

    public static Model modelOf(Statement... statements) {
        return createDefaultModel().add(statements);
    }

    public static Model modelOf(RDFNode... nodes) {
        if (nodes.length % 3 != 0) {
            throw new IllegalArgumentException("nodes");
        }
        var m = createDefaultModel();
        for (var i = 0; i < nodes.length / 3; i++) {
            m.add(nodes[3 * i].asResource(), (Property) nodes[3 * i + 1], nodes[3 * i + 2]);
        }
        return m;
    }
}
