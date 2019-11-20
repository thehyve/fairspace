package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.SparqlUtils;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACLM;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static io.fairspace.saturn.rdf.ModelUtils.getIntegerProperty;
import static io.fairspace.saturn.rdf.ModelUtils.getListProperty;
import static io.fairspace.saturn.rdf.SparqlUtils.querySelect;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static java.lang.String.format;

/**
 * Checks if existing metadata remains valid after changes in the vocabulary.
 *
 * Supported constraints:
 * SHACLM:datatype
 * SHACLM:class
 * SHACLM:minCount
 * SHACLM:maxCount
 * SHACLM:minLength
 * SHACLM:maxLength
 * SHACLM:in
 *
 * It also detects changes in SHACLM:property (a new property added to a specific class), SHACLM:targetClass and SHACLM:path
 */
@AllArgsConstructor
@Slf4j
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private final Dataset dataset;

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        // We first determine which shapes were modified and how the updated vocabulary will look like.
        var oldVocabulary = dataset.getNamedModel(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(removed).union(added);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);

        actuallyAdded.listStatements().forEachRemaining(stmt -> {
            var subject = stmt.getSubject().inModel(newVocabulary);
            var predicate = stmt.getPredicate().inModel(newVocabulary);
            var object = stmt.getObject().inModel(newVocabulary);

            if (subject.getPropertyResourceValue(SHACLM.targetClass) != null) {
                validateClassShapeChanges(subject, predicate, object, violationHandler);
            } else if (subject.getPropertyResourceValue(SHACLM.path) != null) {
                validatePropertyShapeChanges(subject, subject.inModel(oldVocabulary), predicate, violationHandler);
            }
        });
    }

    private void validateClassShapeChanges(Resource classShape, Property predicate, RDFNode object, ViolationHandler violationHandler) {
        var targetClass = classShape.getPropertyResourceValue(SHACLM.targetClass);

        if (predicate.equals(SHACLM.property)) {
            var propertyShape = object.asResource();
                validateProperty(propertyShape, getTargetProperty(propertyShape), List.of(targetClass), violationHandler);
        } else if (predicate.equals(SHACLM.targetClass)) {
            classShape.listProperties(SHACLM.property)
                    .forEachRemaining(s -> {
                                var newPropertyShape = s.getResource();
                                validateProperty(newPropertyShape, getTargetProperty(newPropertyShape), List.of(targetClass), violationHandler);
                            }
                    );
        }
    }

    private void validatePropertyShapeChanges(Resource newPropertyShape, Resource oldPropertyShape, Property predicate, ViolationHandler violationHandler) {
        var property = getTargetProperty(newPropertyShape);

        if (predicate.equals(SHACLM.datatype)) {
            validateDataType(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
        } else if (predicate.equals(SHACLM.class_)) {
            validateClass(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
        } else if (predicate.equals(SHACLM.minCount)) {
            var newMinCount = getIntegerProperty(newPropertyShape, SHACLM.minCount);
            var oldMinCount = getIntegerProperty(oldPropertyShape, SHACLM.minCount);
            if (newMinCount != null && (oldMinCount == null || oldMinCount < newMinCount)) {
                validateMinCount(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
            }
        } else if (predicate.equals(SHACLM.maxCount)) {
            var newMaxCount = getIntegerProperty(newPropertyShape, SHACLM.maxCount);
            var oldMaxCount = getIntegerProperty(oldPropertyShape, SHACLM.maxCount);
            if (newMaxCount != null && (oldMaxCount == null || oldMaxCount > newMaxCount)) {
                validateMaxCount(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
            }
        } else if (predicate.equals(SHACLM.maxLength)) {
            var newMaxLength = getIntegerProperty(newPropertyShape, SHACLM.maxLength);
            var oldMaxLength = getIntegerProperty(oldPropertyShape, SHACLM.maxLength);
            if (newMaxLength != null && (oldMaxLength == null || oldMaxLength > newMaxLength)) {
                validateMaxLength(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
            }
        } else if (predicate.equals(SHACLM.minLength)) {
            var newMinLength = getIntegerProperty(newPropertyShape, SHACLM.minLength);
            var oldMinLength = getIntegerProperty(oldPropertyShape, SHACLM.minLength);
            if (newMinLength != null && (oldMinLength == null || oldMinLength < newMinLength)) {
                validateMinLength(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
            }
        } else if (predicate.equals(SHACLM.in)) {
            var newIn = getListProperty(newPropertyShape, SHACLM.in);
            var oldIn = getListProperty(oldPropertyShape, SHACLM.in);
            if (newIn != null && (oldIn == null || !newIn.asJavaList().containsAll(oldIn.asJavaList()))) {
                validateIn(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
            }
        } else if (predicate.equals(SHACLM.path)) {
            validateProperty(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
        }
    }

    private static Property getTargetProperty(Resource propertyShape) {
        return propertyShape.getModel().createProperty(propertyShape.getPropertyResourceValue(SHACLM.path).getURI());
    }

    private static List<Resource> getClassesWithProperty(Resource propertyShape) {
        var classes = new ArrayList<Resource>();
        var propertyResource = propertyShape.getPropertyResourceValue(SHACLM.path);
        if (propertyResource != null) {
            propertyShape.getModel().listSubjectsWithProperty(SHACLM.property, propertyShape)
                    .forEachRemaining(classShape -> {
                                var subjectClass = classShape.getPropertyResourceValue(SHACLM.targetClass);
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
        var dataType = propertyShape.getPropertyResourceValue(SHACLM.datatype);
        if (dataType != null) {
            querySelect(dataset, storedQuery("find_wrong_data_type", property, subjectClasses, dataType), row ->
                    violationHandler.onViolation("Value does not have datatype " + dataType, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateClass(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var theClass = propertyShape.getPropertyResourceValue(SHACLM.class_);
        if (theClass != null) {
            querySelect(dataset, storedQuery("find_wrong_class", property, subjectClasses, theClass), row ->
                    violationHandler.onViolation("Value needs to have class " + theClass, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMaxLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var maxLength = getIntegerProperty(propertyShape, SHACLM.maxLength);
        if (maxLength != null) {
            querySelect(dataset, storedQuery("find_too_long", property, subjectClasses, maxLength), row ->
                    violationHandler.onViolation(format("Value has more than %d characters", maxLength), row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMinLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var minLength = getIntegerProperty(propertyShape, SHACLM.minLength);
        if (minLength != null) {
            querySelect(dataset, storedQuery("find_too_short", property, subjectClasses, minLength), row ->
                    violationHandler.onViolation(format("Value has less than %d characters", minLength), row.getResource("subject"), property, row.get("object")));
        }
    }


    private void validateMinCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var minCount = getIntegerProperty(propertyShape, SHACLM.minCount);
        if (minCount != null) {
            querySelect(dataset, storedQuery("find_too_few", property, subjectClasses, minCount), row ->
                    violationHandler.onViolation(format("Less than %d values", minCount), row.getResource("subject"), property, null));
        }
    }

    private void validateMaxCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var maxCount = getIntegerProperty(propertyShape, SHACLM.maxCount);
        if (maxCount != null) {
            querySelect(dataset, storedQuery("find_too_many", property, subjectClasses, maxCount), row ->
                    violationHandler.onViolation(format("More than %d values", maxCount), row.getResource("subject"), property, null));
        }
    }

    private void validateIn(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler) {
        var values = getListProperty(propertyShape, SHACLM.in);

        if (values != null) {
            querySelect(dataset, storedQuery("find_not_in", property, subjectClasses, values), row ->
                    violationHandler.onViolation("Value is not in " + SparqlUtils.toString(values), row.getResource("subject"), property, row.get("object")));
        }
    }
}
