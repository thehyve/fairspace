package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.SparqlUtils;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
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
 * Checks if existing metadata remains valid after changes in the vocabulary.
 * <p>
 * Supported constraints:
 * sh:datatype
 * sh:class
 * sh:minCount
 * sh:maxCount
 * sh:minLength
 * sh:maxLength
 * sh:in
 * <p>
 * It also detects changes in sh:property (a new property added to a specific class), sh:targetClass and sh:path
 */
@AllArgsConstructor
@Slf4j
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler, RDFConnection rdf) {
        // We first determine which shapes were modified and how the updated vocabulary will look like.
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(removed).union(added);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);

        actuallyAdded.listStatements().forEachRemaining(stmt -> {
            var subject = stmt.getSubject().inModel(newVocabulary);
            var predicate = stmt.getPredicate().inModel(newVocabulary);
            var object = stmt.getObject().inModel(newVocabulary);

            if (subject.getPropertyResourceValue(SH.targetClass) != null) {
                validateClassShapeChanges(subject, predicate, object, violationHandler);
            } else if (subject.getPropertyResourceValue(SH.path) != null) {
                validatePropertyShapeChanges(subject, subject.inModel(oldVocabulary), predicate, violationHandler, rdf);
            }
        });
    }

    private void validateClassShapeChanges(Resource classShape, Property predicate, RDFNode object, ViolationHandler violationHandler) {
        var targetClass = classShape.getPropertyResourceValue(SH.targetClass);

        if (predicate.equals(SH.property)) {
            var propertyShape = object.asResource();
            validateProperty(propertyShape, getTargetProperty(propertyShape), List.of(targetClass), violationHandler);
        } else if (predicate.equals(SH.targetClass)) {
            classShape.listProperties(SH.property)
                    .forEachRemaining(s -> {
                                var newPropertyShape = s.getResource();
                                validateProperty(newPropertyShape, getTargetProperty(newPropertyShape), List.of(targetClass), violationHandler);
                            }
                    );
        }
    }

    private void validatePropertyShapeChanges(Resource newPropertyShape, Resource oldPropertyShape, Property predicate, ViolationHandler violationHandler, RDFConnection rdf) {
        var property = getTargetProperty(newPropertyShape);

        if (predicate.equals(SH.datatype)) {
            validateDataType(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
        } else if (predicate.equals(SH.class_)) {
            validateClass(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
        } else if (predicate.equals(SH.minCount)) {
            var newMinCount = getIntegerProperty(newPropertyShape, SH.minCount);
            var oldMinCount = getIntegerProperty(oldPropertyShape, SH.minCount);
            if (newMinCount != null && (oldMinCount == null || oldMinCount < newMinCount)) {
                validateMinCount(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
            }
        } else if (predicate.equals(SH.maxCount)) {
            var newMaxCount = getIntegerProperty(newPropertyShape, SH.maxCount);
            var oldMaxCount = getIntegerProperty(oldPropertyShape, SH.maxCount);
            if (newMaxCount != null && (oldMaxCount == null || oldMaxCount > newMaxCount)) {
                validateMaxCount(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
            }
        } else if (predicate.equals(SH.maxLength)) {
            var newMaxLength = getIntegerProperty(newPropertyShape, SH.maxLength);
            var oldMaxLength = getIntegerProperty(oldPropertyShape, SH.maxLength);
            if (newMaxLength != null && (oldMaxLength == null || oldMaxLength > newMaxLength)) {
                validateMaxLength(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
            }
        } else if (predicate.equals(SH.minLength)) {
            var newMinLength = getIntegerProperty(newPropertyShape, SH.minLength);
            var oldMinLength = getIntegerProperty(oldPropertyShape, SH.minLength);
            if (newMinLength != null && (oldMinLength == null || oldMinLength < newMinLength)) {
                validateMinLength(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
            }
        } else if (predicate.equals(SH.in)) {
            var newIn = getListProperty(newPropertyShape, SH.in);
            var oldIn = getListProperty(oldPropertyShape, SH.in);
            if (newIn != null && (oldIn == null || !newIn.asJavaList().containsAll(oldIn.asJavaList()))) {
                validateIn(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler, rdf);
            }
        } else if (predicate.equals(SH.path)) {
            validateProperty(newPropertyShape, property, getClassesWithProperty(newPropertyShape), violationHandler);
        }
    }

    private static Property getTargetProperty(Resource propertyShape) {
        return propertyShape.getModel().createProperty(propertyShape.getPropertyResourceValue(SH.path).getURI());
    }

    private static List<Resource> getClassesWithProperty(Resource propertyShape) {
        var classes = new ArrayList<Resource>();
        var propertyResource = propertyShape.getPropertyResourceValue(SH.path);
        if (propertyResource != null) {
            propertyShape.getModel().listSubjectsWithProperty(SH.property, propertyShape)
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
        validateProperty(propertyShape, property, subjectClasses, violationHandler);
    }

    private void validateProperty(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        validateDataType(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateClass(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateMaxLength(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateMinLength(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateMinCount(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateMaxCount(propertyShape, property, subjectClasses, violationHandler, rdf);
        validateIn(propertyShape, property, subjectClasses, violationHandler, rdf);
    }

    private void validateDataType(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var dataType = propertyShape.getPropertyResourceValue(SH.datatype);
        if (dataType != null) {
            rdf.querySelect(storedQuery("find_wrong_data_type", property, subjectClasses, dataType), row ->
                    violationHandler.onViolation("Value does not have datatype " + dataType, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateClass(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var theClass = propertyShape.getPropertyResourceValue(SH.class_);
        if (theClass != null) {
            rdf.querySelect(storedQuery("find_wrong_class", property, subjectClasses, theClass), row ->
                    violationHandler.onViolation("Value needs to have class " + theClass, row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMaxLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var maxLength = getIntegerProperty(propertyShape, SH.maxLength);
        if (maxLength != null) {
            rdf.querySelect(storedQuery("find_too_long", property, subjectClasses, maxLength), row ->
                    violationHandler.onViolation(format("Value has more than %d characters", maxLength), row.getResource("subject"), property, row.get("object")));
        }
    }

    private void validateMinLength(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var minLength = getIntegerProperty(propertyShape, SH.minLength);
        if (minLength != null) {
            rdf.querySelect(storedQuery("find_too_short", property, subjectClasses, minLength), row ->
                    violationHandler.onViolation(format("Value has less than %d characters", minLength), row.getResource("subject"), property, row.get("object")));
        }
    }


    private void validateMinCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var minCount = getIntegerProperty(propertyShape, SH.minCount);
        if (minCount != null) {
            rdf.querySelect(storedQuery("find_too_few", property, subjectClasses, minCount), row ->
                    violationHandler.onViolation(format("Less than %d values", minCount), row.getResource("subject"), property, null));
        }
    }

    private void validateMaxCount(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var maxCount = getIntegerProperty(propertyShape, SH.maxCount);
        if (maxCount != null) {
            rdf.querySelect(storedQuery("find_too_many", property, subjectClasses, maxCount), row ->
                    violationHandler.onViolation(format("More than %d values", maxCount), row.getResource("subject"), property, null));
        }
    }

    private void validateIn(Resource propertyShape, Property property, Collection<Resource> subjectClasses, ViolationHandler violationHandler, RDFConnection rdf) {
        var values = getListProperty(propertyShape, SH.in);

        if (values != null) {
            rdf.querySelect(storedQuery("find_not_in", property, subjectClasses, values), row ->
                    violationHandler.onViolation("Value is not in " + SparqlUtils.toString(values), row.getResource("subject"), property, row.get("object")));
        }
    }
}
