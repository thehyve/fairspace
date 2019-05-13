package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import java.util.HashSet;
import java.util.Set;

import static com.google.common.collect.Sets.union;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;

/**
 * Checks if existing metadata remains valid after changes in the vocabulary
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    static final int MAX_SUBJECTS = 10;
    // This static exception instance is used to stop further validation
    private static final TooManyViolationsException TOO_MANY_VIOLATIONS = new TooManyViolationsException();

    private final RDFConnection rdf;

    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        // We first determine which shapes were modified and how the updated vocabulary will look like.
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);
        var actuallyRemoved = oldVocabulary.difference(newVocabulary);
        var modifiedShapes = union(actuallyRemoved.listSubjects().toSet(), actuallyAdded.listSubjects().toSet());

        // And then check, if the model is still valid with the updated vocabulary
        var terminatingViolationHandlerWrapper = new ViolationHandler() {
            private Set<Resource> subjects = new HashSet<>();

            @Override
            public void onViolation(String message, Resource subject, Property predicate, RDFNode object) {
                violationHandler.onViolation(message, subject, predicate, object);
                subjects.add(subject);
                if(subjects.size() == MAX_SUBJECTS) {
                    throw TOO_MANY_VIOLATIONS; // Stop validation
                }
            }
        };

        try {
            validateModifiedShapes(modifiedShapes, newVocabulary, terminatingViolationHandlerWrapper);
        } catch (TooManyViolationsException ignore) {
        }
    }

    private void validateModifiedShapes(Set<Resource> shapes, Model vocabulary, ViolationHandler violationHandler) {
        for (var shape: shapes) {
            validateByTargetClass(shape, vocabulary, violationHandler);
            validateByPropertyPath(shape, vocabulary, violationHandler);
        }
    }

    private void validateByTargetClass(Resource shape, Model vocabulary, ViolationHandler violationHandler) {
        // determine the target class (if any) and validate all the entities belonging to it
        var targetClass = shape.inModel(vocabulary).getPropertyResourceValue(SH.targetClass);

        if (targetClass != null && targetClass.isURIResource()) {
            rdf.querySelect(
                    storedQuery("subjects_by_type", targetClass),
                    row -> validateResource(row.getResource("s"), vocabulary, violationHandler)
            );
        }
    }


    private void validateByPropertyPath(Resource shape, Model vocabulary, ViolationHandler violationHandler) {
        // determine the underlying property path (if any) and validate all the entities having it
        var path = shape.inModel(vocabulary).getPropertyResourceValue(SH.path);

        if (path != null && path.isURIResource()) {
            rdf.querySelect(
                    storedQuery("subjects_with_property", path),
                    row -> validateResource(row.getResource("s"), vocabulary, violationHandler)
            );
        }
    }

    @SneakyThrows
    private void validateResource(Resource resource, Model vocabulary, ViolationHandler violationHandler) {
        var dataModel = rdf.queryConstruct(storedQuery("triples_by_subject_with_object_types", resource));
        var validationEngine = createEngine(dataModel, vocabulary);
        validationEngine.validateNode(resource.asNode());
        getViolations(validationEngine, violationHandler);
    }

    private static class TooManyViolationsException extends RuntimeException {}
}
