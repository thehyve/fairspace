package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;
import java.util.function.Consumer;

import static com.google.common.collect.Sets.union;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getValidationResult;
import static io.fairspace.saturn.services.metadata.validation.ValidationResult.mergeValidationResults;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;

/**
 * Checks if existing metadata remains valid after changes in the vocabulary
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        // We first determine which shapes were modified and how the updated vocabulary will look like.
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);
        var actuallyRemoved = oldVocabulary.difference(newVocabulary);
        var modifiedShapes = union(actuallyRemoved.listSubjects().toSet(), actuallyAdded.listSubjects().toSet());

        // And then check, if the model is still valid with the updated vocabulary
        return validateModifiedShapes(modifiedShapes, newVocabulary);
    }

    private ValidationResult validateModifiedShapes(Set<Resource> shapes, Model vocabulary) {
        return mergeValidationResults(onResult ->
                shapes.forEach(shape -> {
                    validateByTargetClass(shape, vocabulary, onResult);
                    validateByPropertyPath(shape, vocabulary, onResult);
                }));
    }

    private void validateByTargetClass(Resource shape, Model vocabulary, Consumer<ValidationResult> onResult) {
        // determine the target class (if any) and validate all the entities belonging to it
        vocabulary.listObjectsOfProperty(shape, SH.targetClass)
                .forEachRemaining(targetClass -> rdf.querySelect(storedQuery("subjects_by_type", targetClass),
                        row -> validateResource(row.getResource("s"), vocabulary, onResult)));
    }


    private void validateByPropertyPath(Resource shape, Model vocabulary, Consumer<ValidationResult> onResult) {
        // determine the underlying property path (if any) and validate all the entities having it
        vocabulary.listObjectsOfProperty(shape, SH.path)
                .forEachRemaining(path -> rdf.querySelect(storedQuery("subjects_with_property", path),
                        row -> validateResource(row.getResource("s"), vocabulary, onResult)));
    }

    @SneakyThrows
    private void validateResource(Resource resource, Model vocabulary, Consumer<ValidationResult> onResult) {
        var dataModel = rdf.queryConstruct(storedQuery("triples_by_subject_with_object_types", resource));
        var validationEngine = createEngine(dataModel, vocabulary);
        validationEngine.validateNode(resource.asNode());
        onResult.accept(getValidationResult(validationEngine));
    }
}
