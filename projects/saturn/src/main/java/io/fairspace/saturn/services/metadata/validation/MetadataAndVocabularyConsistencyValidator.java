package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.HashSet;
import java.util.stream.Stream;

import static com.google.common.collect.Sets.union;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.*;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

/**
 * Prohibits any modification of vocabulary resources used in metadata, except to a few whitelisted properties
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    @SneakyThrows(InterruptedException.class)
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);
        var actuallyRemoved = oldVocabulary.difference(newVocabulary);
        var affectedSubjects = union(actuallyRemoved.listSubjects().toSet(), actuallyAdded.listSubjects().toSet());

        var affectedClasses = new HashSet<Resource>();
        var affectedProperties = new HashSet<Resource>();

        Stream.of(oldVocabulary, newVocabulary)
                .forEach(vocabulary ->
                        affectedSubjects.stream()
                                .filter(Resource::isURIResource)
                                .map(subj -> vocabulary.createResource(subj.getURI()))
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
                                }));

        var result = ValidationResult.VALID;

        var withMeta = newVocabulary.union(META_VOCABULARY);

        for(var c: affectedClasses) {
            var search = rdf.queryConstruct(storedQuery("select_by_mask", defaultGraphIRI, null, RDF.type, c));
            result = result.merge(validateResources(search, withMeta));
        }

        for(var p: affectedProperties) {
            var search = rdf.queryConstruct(storedQuery("select_by_mask", defaultGraphIRI, null, p, null));
            result = result.merge(validateResources(search, withMeta));
        }

        return result;
    }

    private ValidationResult validateResources(Model model, Model vocabulary) throws InterruptedException {
        var result = ValidationResult.VALID;
        for (var it = model.listSubjects(); it.hasNext(); ) {
            var subject = it.next();
            if (subject.isURIResource()) {
                var subjectModel = rdf.queryConstruct(storedQuery("select_by_mask", defaultGraphIRI, subject, null, null));
                addObjectTypes(model, defaultGraphIRI, rdf);
                result = result.merge(validateResource(subject, subjectModel, vocabulary));
            }
        }
        return result;
    }

    private ValidationResult validateResource(Resource resource, Model model, Model vocabulary) throws InterruptedException {
        var validationEngine = createEngine(model, vocabulary.union(Vocabularies.META_VOCABULARY));
        validationEngine.validateNode(resource.asNode());
        return getValidationResult(validationEngine);
    }
}
