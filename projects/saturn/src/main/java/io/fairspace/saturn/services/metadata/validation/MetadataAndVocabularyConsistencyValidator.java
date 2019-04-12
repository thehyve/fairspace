package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.HashSet;
import java.util.function.Consumer;

import static com.google.common.collect.Sets.union;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getValidationResult;
import static io.fairspace.saturn.util.Ref.ref;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;

/**
 * Prohibits any modification of vocabulary resources used in metadata, except to a few whitelisted properties
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);
        var actuallyRemoved = oldVocabulary.difference(newVocabulary);
        var affectedSubjects = union(actuallyRemoved.listSubjects().toSet(), actuallyAdded.listSubjects().toSet());

        var affectedClasses = new HashSet<Resource>();
        var affectedProperties = new HashSet<Resource>();

        affectedSubjects.stream()
                .filter(Resource::isURIResource)
                .map(subj -> newVocabulary.createResource(subj.getURI()))
                .forEach(vocabularyResource -> {
                    if (vocabularyResource.hasProperty(RDF.type, FS.ClassShape)) {
                        var targetClass = vocabularyResource.getPropertyResourceValue(SH.targetClass);
                        if (targetClass != null) {
                            affectedClasses.add(targetClass);
                        }
                    } else if (vocabularyResource.hasProperty(RDF.type, FS.PropertyShape)
                            || vocabularyResource.hasProperty(RDF.type, FS.RelationShape)) {
                        var targetProperty = vocabularyResource.getPropertyResourceValue(SH.path);
                        if (targetProperty != null) {
                            affectedProperties.add(targetProperty);
                        }
                    }
                });

        var result = ref(ValidationResult.VALID);

        var withMeta = newVocabulary.union(META_VOCABULARY);

        Consumer<QuerySolution> subjectValidator = row ->
                result.value = result.value.merge(validateResource(row.getResource("s"), withMeta));

        affectedClasses.forEach(c -> rdf.querySelect(storedQuery("subjects_by_type", c), subjectValidator));
        affectedProperties.forEach(p -> rdf.querySelect(storedQuery("subjects_with_property", p), subjectValidator));

        return result.value;
    }

    @SneakyThrows
    private ValidationResult validateResource(Resource resource, Model vocabulary) {
        var dataModel = rdf.queryConstruct(storedQuery("triples_by_subject_with_object_types", resource));
        var validationEngine = createEngine(dataModel, vocabulary);
        validationEngine.validateNode(resource.asNode());
        return getValidationResult(validationEngine);
    }
}
