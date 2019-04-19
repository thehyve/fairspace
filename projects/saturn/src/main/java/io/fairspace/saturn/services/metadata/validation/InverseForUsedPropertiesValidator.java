package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.Ref.ref;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static java.lang.String.format;
import static org.topbraid.spin.util.JenaUtil.getResourceProperty;

/**
 * Ensures that no changes are made to fs:inverseRelation in the vocabulary that
 * would break the metadata validity.
 *
 * More specifically, it will disallow additions of fs:inverseRelation where the specific
 * property has already been used in the metadata.
 */
@AllArgsConstructor
public class InverseForUsedPropertiesValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ref(ValidationResult.VALID);

        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);

        actuallyAdded.listSubjectsWithProperty(FS.inverseRelation).forEachRemaining(shape -> {
            var property = getResourceProperty(shape, SH.path);
            if (property != null) {
                if (rdf.queryAsk(storedQuery("is_property_used", property))) {
                    var error = new ValidationResult(format("Cannot set fs:inverseRelation for %s, property %s has been used already", shape, property));
                    result.value = result.value.merge(error);
                }
            }
        });

        return result.value;
    }
}
