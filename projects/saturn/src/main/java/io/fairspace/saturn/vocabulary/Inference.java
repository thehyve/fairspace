package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.topbraid.spin.util.JenaUtil.getResourceProperties;

public class Inference {
    public static Model applyInference(Model vocabulary, Model model) {
        return model.add(getInferredStatements(vocabulary, model, model));
    }

    public static Model applyInference(Model vocabulary, Model base, Model changes) {
        return changes.add(getInferredStatements(vocabulary, base, changes));
    }

    public static Model getInferredStatements(Model vocabulary, Model base, Model changes) {
        var inferred = createDefaultModel();

         changes.listStatements()
                .filterKeep(stmt -> stmt.getObject().isResource())
                 .mapWith(stmt -> base.createStatement(stmt.getSubject(), stmt.getPredicate(), stmt.getObject()))
                .forEachRemaining(stmt -> getInversePropertyForStatement(stmt, vocabulary)
                        .map(inverseProperty -> stmt.getModel().createStatement(stmt.getObject().asResource(), inverseProperty, stmt.getSubject()))
                        .ifPresent(inferred::add)
                );

        return inferred;
    }

    public static Optional<Resource> getClassShapeForResource(Resource resource, Model vocabulary) {
        return ofNullable(resource.getPropertyResourceValue(RDF.type))
                .flatMap(type -> getClassShapeForClass(type, vocabulary));
    }

    public static Optional<Resource> getClassShapeForClass(Resource type, Model vocabulary) {
        return vocabulary.listSubjectsWithProperty(SH.targetClass, type).nextOptional();
    }

    public static List<Resource> getPropertyShapesForResource(Resource resource, Model vocabulary) {
        return getClassShapeForResource(resource, vocabulary)
                .map(classShape -> getResourceProperties(classShape, SH.property))
                .orElse(List.of());
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
