package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.SparqlUtils;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Collections;
import java.util.List;

import static java.lang.String.format;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.topbraid.spin.util.JenaUtil.getListProperty;
import static org.topbraid.spin.util.JenaUtil.getResourceProperties;

public class ShaclValidator implements MetadataRequestValidator {
    private static final Property CLOSED = createProperty(SH.NS, "closed");
    private static final Property IGNORED_PROPERTIES = createProperty(SH.NS, "ignoredProperties");

    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affected = removed.listSubjects()
                .andThen(added.listSubjects())
                .toSet();

        if (affected.isEmpty()) {
            return;
        }

        affected.forEach(resource -> validateResource(resource.inModel(after), vocabulary, violationHandler));
    }

    private void validateResource(Resource resource, Model vocabulary, ViolationHandler violationHandler) {
        getResourceProperties(resource, RDF.type)
                .forEach(type -> vocabulary.listSubjectsWithProperty(SH.targetClass, type)
                        .forEachRemaining(shape -> validateResource(resource, shape, violationHandler)));
    }

    private void validateResource(Resource resource, Resource classShape, ViolationHandler violationHandler) {
        var propertyShapes = getResourceProperties(classShape, SH.property);

        if (classShape.hasLiteral(CLOSED, true)) {
            var ignored = classShape.hasProperty(IGNORED_PROPERTIES) ? getListProperty(classShape, IGNORED_PROPERTIES).asJavaList() : Collections.<RDFNode>emptyList();
            resource.listProperties()
                    .forEachRemaining(stmt -> {
                        if (propertyShapes.stream().noneMatch(ps -> stmt.getPredicate().getURI().equals(ps.getPropertyResourceValue(SH.path).getURI()))
                        && ignored.stream().noneMatch(p -> stmt.getPredicate().getURI().equals(p.asResource().getURI()))) {
                            violationHandler.onViolation(format("Predicate <%s> is not allowed (closed shape)", stmt.getPredicate()), stmt);
                        }
                    });
        }

        propertyShapes.forEach(propertyShape -> validateProperty(resource, propertyShape, violationHandler));
    }

    private void validateProperty(Resource resource, Resource propertyShape, ViolationHandler violationHandler) {
        getResourceProperties(propertyShape, SH.path)
                .stream()
                .map(o -> createProperty(o.asResource().getURI()))
                .forEach(p -> validatePropertyValues(resource, p, resource.listProperties(p).mapWith(Statement::getObject).toList(), propertyShape, violationHandler));
    }

    private void validatePropertyValues(Resource resource, Property property, List<RDFNode> values, Resource propertyShape, ViolationHandler violationHandler) {
        propertyShape.listProperties()
                .forEachRemaining(statement -> {
                    var predicate = statement.getPredicate();

                    if (predicate.equals(SH.minCount)) {
                        if (values.size() < statement.getInt()) {
                            violationHandler.onViolation(format("Less than %d values", statement.getInt()), resource, property, null);
                        }
                    } else if (predicate.equals(SH.maxCount)) {
                        if (values.size() > statement.getInt()) {
                            violationHandler.onViolation(format("More than %d values", statement.getInt()), resource, property, null);
                        }
                    } else if (predicate.equals(SH.datatype)) {
                        var dataType = statement.getResource().getURI();
                        values.forEach(v -> {
                            if (!v.isLiteral() || !dataType.equals(v.asLiteral().getDatatypeURI())) {
                                violationHandler.onViolation("Value does not have datatype " + dataType, resource, property, v);
                            }
                        });
                    } else if (predicate.equals(SH.class_)) {
                        var type = statement.getResource();
                        values.forEach(v -> {
                            if (!v.isResource() || !type.equals(v.asResource().getPropertyResourceValue(RDF.type))) {
                                violationHandler.onViolation("Value does not have class " + type, resource, property, v);
                            }
                        });
                    } else if (predicate.equals(SH.in)) {
                        var expected = getListProperty(propertyShape, SH.in);
                        values.forEach(v -> {
                            if (!expected.contains(v)) {
                                violationHandler.onViolation("Value is not in " + SparqlUtils.toString(expected), resource, property, v);
                            }
                        });
                    } else if (predicate.equals(SH.minLength)) {
                        var minLength = statement.getInt();
                        values.forEach(v -> {
                            if (!v.isLiteral() || v.asLiteral().getString().length() < minLength) {
                                violationHandler.onViolation(format("Value has less than %d characters", minLength), resource, property, v);
                            }
                        });
                    } else if (predicate.equals(SH.maxLength)) {
                        var maxLength = statement.getInt();
                        values.forEach(v -> {
                            if (!v.isLiteral() || v.asLiteral().getString().length() > maxLength) {
                                violationHandler.onViolation(format("Value has more than %d characters", maxLength), resource, property, v);
                            }
                        });
                    }
                });
    }
}
