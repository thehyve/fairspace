package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;

import static io.fairspace.saturn.rdf.ModelUtils.asNode;

@FunctionalInterface
public interface ViolationHandler {
    void onViolation(String message, Node subject, Node predicate, Node object);

    default void onViolation(String message, Resource subject, Property predicate, RDFNode object) {
        onViolation(message, asNode(subject), asNode(predicate), asNode(object));
    }

    default void onViolation(String message, Statement statement) {
        onViolation(message, statement.getSubject(), statement.getPredicate(), statement.getObject());
    }
}
