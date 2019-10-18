package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Iterator;
import java.util.Optional;
import java.util.Set;

import static java.util.Optional.ofNullable;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

public class Inference {
    public static Model applyInference(Model vocabulary, Model model) {
        return model.add(getInferredStatements(vocabulary, model));
    }

    public static Model getInferredStatements(Model vocabulary, Model model) {
        var inferred = createDefaultModel();

        model.listStatements()
                .filterKeep(stmt -> stmt.getObject().isResource())
                .forEachRemaining(stmt -> getInversePropertyForStatement(stmt, vocabulary)
                        .map(inverseProperty -> stmt.getModel().createStatement(stmt.getObject().asResource(), inverseProperty, stmt.getSubject()))
                        .ifPresent(inferred::add)
                );

        return inferred;
    }

    public static Optional<Resource> getClassShapeForResource(Resource resource, Model vocabulary) {
        return ofNullable(resource.getPropertyResourceValue(RDF.type))
                .map(type -> vocabulary.listSubjectsWithProperty(SH.targetClass, type))
                .filter(Iterator::hasNext)
                .map(Iterator::next);
    }

    public static Set<Resource> getPropertyShapesForResource(Resource resource, Model vocabulary) {
        return getClassShapeForResource(resource, vocabulary)
                .map(classShape -> classShape.listProperties(SH.property)
                        .mapWith(Statement::getObject)
                        .filterKeep(RDFNode::isResource)
                        .mapWith(RDFNode::asResource)
                        .toSet()
                ).orElse(Set.of());
    }

    public static Optional<Resource> getPropertyShapeForStatement(Statement statement, Model vocabulary) {
        return getPropertyShapesForResource(statement.getSubject(), vocabulary)
                .stream()
                .filter(ps -> ps.hasProperty(SH.path, statement.getPredicate()))
                .findFirst();
    }

    public static Optional<Resource> getInversePropertyShapeForStatement(Statement statement, Model vocabulary) {
        return getPropertyShapeForStatement(statement, vocabulary)
                .map(shape -> shape.getPropertyResourceValue(FS.inverseRelation));
    }

    public static Optional<Property> getInversePropertyForStatement(Statement statement, Model vocabulary) {
        return getInversePropertyShapeForStatement(statement, vocabulary)
                .map(shape -> shape.getPropertyResourceValue(SH.path))
                .map(resource -> createProperty(resource.getURI()));
    }
}
