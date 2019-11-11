package io.fairspace.saturn.util;

import org.apache.jena.graph.compose.Difference;
import org.apache.jena.graph.compose.Union;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.impl.ModelCom;
import org.apache.jena.sparql.graph.GraphZero;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class ModelUtils {
    /**
     * An immutable empty model
     */
    public static final Model EMPTY_MODEL = new ModelCom(GraphZero.instance());

    /**
     *
     * @param statements
     * @return A mutable model initialized with statements
     */
    public static Model modelOf(Statement... statements) {
        return createDefaultModel().add(statements);
    }

    /**
     * @param nodes
     * @return A mutable model consisting of statements produced by splitting nodes into triples
     */
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

    public static Model differenceView(Model left, Model right) {
        return right.isEmpty() ? left : new ModelCom(new Difference(left.getGraph(), right.getGraph()));
    }

    public static Model unionView(Model left, Model right) {
        return right.isEmpty() ? left : new ModelCom(new Union(left.getGraph(), right.getGraph()));
    }

    public static Model updatedView(Model base, Model removed, Model added) {
        return unionView(differenceView(base, removed), added);
    }

}
