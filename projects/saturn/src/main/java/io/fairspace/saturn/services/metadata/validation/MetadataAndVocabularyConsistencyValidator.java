package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.SparqlUtils;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static java.lang.String.format;
import static org.topbraid.spin.util.JenaUtil.getIntegerProperty;
import static org.topbraid.spin.util.JenaUtil.getListProperty;

/**
 * Checks if existing metadata remains valid after changes in the vocabulary
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        // We first determine which shapes were modified and how the updated vocabulary will look like.
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);

        actuallyAdded.listStatements().forEachRemaining(stmt -> {
            var subject = stmt.getSubject().inModel(newVocabulary);

            if (subject.getPropertyResourceValue(SH.targetClass) != null) {
                var targetClass = subject.getPropertyResourceValue(SH.targetClass);

                if (stmt.getPredicate().equals(SH.property) && stmt.getObject().isResource()) {
                    var propertyShape = stmt.getObject().asResource().inModel(newVocabulary);
                    if (propertyShape.hasProperty(SH.path)) {
                        var property = newVocabulary.createProperty(propertyShape.getPropertyResourceValue(SH.path).getURI());
                        validateProperty(propertyShape, property, List.of(targetClass), violationHandler);
                    }
                }
            } else if (subject.getPropertyResourceValue(SH.path) != null) {
                    var property = newVocabulary.createProperty(subject.getPropertyResourceValue(SH.path).getURI());

                    if (stmt.getPredicate().equals(SH.datatype)) {
                        validateDataType(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                    } else if (stmt.getPredicate().equals(SH.class_)) {
                        validateClass(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                    } else if (stmt.getPredicate().equals(SH.minCount)) {
                        var newMinCount = getIntegerProperty(subject, SH.minCount);
                        var oldMinCount = getIntegerProperty(subject.inModel(oldVocabulary), SH.minCount);
                        if (newMinCount != null && (oldMinCount == null || oldMinCount < newMinCount)) {
                            validateMinCount(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                        }
                    } else if (stmt.getPredicate().equals(SH.maxCount)) {
                        var newMaxCount = getIntegerProperty(subject, SH.maxCount);
                        var oldMaxCount = getIntegerProperty(subject.inModel(oldVocabulary), SH.maxCount);
                        if (newMaxCount != null && (oldMaxCount == null || oldMaxCount > newMaxCount)) {
                            validateMaxCount(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                        }
                    } else if (stmt.getPredicate().equals(SH.maxLength)) {
                        var newMaxLength = getIntegerProperty(subject, SH.maxLength);
                        var oldMaxLength = getIntegerProperty(subject.inModel(oldVocabulary), SH.maxLength);
                        if (newMaxLength != null && (oldMaxLength == null || oldMaxLength > newMaxLength)) {
                            validateMaxLength(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                        }
                    } else if (stmt.getPredicate().equals(SH.minLength)) {
                        var newMinLength = getIntegerProperty(subject, SH.minLength);
                        var oldMinLength = getIntegerProperty(subject.inModel(oldVocabulary), SH.minLength);
                        if (newMinLength != null && (oldMinLength == null || oldMinLength < newMinLength)) {
                           validateMinLength(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                        }
                    } else if (stmt.getPredicate().equals(SH.in)) {
                        var newIn = getListProperty(subject, SH.in);
                        var oldIn = getListProperty(subject.inModel(oldVocabulary), SH.in);
                        if (newIn != null && (oldIn == null || !newIn.asJavaList().containsAll(oldIn.asJavaList()))) {
                            validateIn(subject, property, getClassesWithProperty(subject, newVocabulary), violationHandler);
                        }
                    }
                }
        });
    }

    private static List<Resource> getClassesWithProperty(Resource propertyShape, Model vocabulary) {
        var classes = new ArrayList<Resource>();
        var propertyResource = propertyShape.getPropertyResourceValue(SH.path);
        if (propertyResource != null) {
            vocabulary.listSubjectsWithProperty(SH.property, propertyShape)
                    .forEachRemaining(classShape -> {
                                var subjectClass = classShape.getPropertyResourceValue(SH.targetClass);
                                if (subjectClass != null) {
                                    classes.add(subjectClass);
                                }
                            }
                    );
        }
        return classes;
    }

    private void validateProperty(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        validateDataType(propertyShape, property, subjectClasses, violationHandler);
        validateClass(propertyShape, property, subjectClasses, violationHandler);
        validateMaxLength(propertyShape, property, subjectClasses, violationHandler);
        validateMinLength(propertyShape, property, subjectClasses, violationHandler);
        validateMinCount(propertyShape, property, subjectClasses, violationHandler);
        validateMaxCount(propertyShape, property, subjectClasses, violationHandler);
        validateIn(propertyShape, property, subjectClasses, violationHandler);
    }

    private void validateDataType(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var dataType = propertyShape.getPropertyResourceValue(SH.datatype);
        if (dataType != null) {
            rdf.querySelect(storedQuery("find_wrong_data_type", property, subjectClasses, dataType), row ->
                    violationHandler.onViolation("Value does not have datatype " + dataType, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateClass(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var theClass = propertyShape.getPropertyResourceValue(SH.class_);
        if (theClass != null) {
            rdf.querySelect(storedQuery("find_wrong_class", property, subjectClasses, theClass), row ->
                    violationHandler.onViolation("Value needs to have class " + theClass, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMaxLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var maxLength = getIntegerProperty(propertyShape, SH.maxLength);
        if (maxLength != null) {
            rdf.querySelect(storedQuery("find_too_long", property, subjectClasses, maxLength), row ->
                    violationHandler.onViolation(format("Value has more than %d characters", maxLength), row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMinLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var minLength = getIntegerProperty(propertyShape, SH.minLength);
        if (minLength != null) {
            rdf.querySelect(storedQuery("find_too_short", property, subjectClasses, minLength), row ->
                    violationHandler.onViolation(format("Value has less than %d characters", minLength), row.getResource("subject"), property, row.get("object")));
        }
    }


    private void validateMinCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var minCount = getIntegerProperty(propertyShape, SH.minCount);
        if (minCount != null) {
            rdf.querySelect(storedQuery("find_too_few", property, subjectClasses, minCount), row ->
                    violationHandler.onViolation(format("Less than %d values", minCount), row.getResource("subject"), property, null));
        }
    }

    private void validateMaxCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var maxCount = getIntegerProperty(propertyShape, SH.maxCount);
        if (maxCount != null) {
            rdf.querySelect(storedQuery("find_too_many", property, subjectClasses, maxCount), row ->
                    violationHandler.onViolation(format("More than %d values", maxCount), row.getResource("subject"), property, null));
        }
    }

    private void validateIn(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var values = getListProperty(propertyShape, SH.in);

        if (values != null) {
            rdf.querySelect(storedQuery("find_not_in", property, subjectClasses, values), row ->
                    violationHandler.onViolation("Value is not in " + SparqlUtils.toString(values), row.getResource("subject"), property, row.get("object")));
        }
    }
}
