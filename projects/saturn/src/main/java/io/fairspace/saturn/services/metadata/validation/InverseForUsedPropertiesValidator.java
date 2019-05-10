package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
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
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        var oldVocabulary = rdf.fetch(VOCABULARY_GRAPH_URI.getURI());
        var newVocabulary = oldVocabulary.difference(modelToRemove).union(modelToAdd);
        var actuallyAdded = newVocabulary.difference(oldVocabulary);

        actuallyAdded.listStatements(null, FS.inverseRelation, (RDFNode) null).forEachRemaining(stmt -> {
            var shape = stmt.getSubject();
            var property = getResourceProperty(shape, SH.path);
            if (property != null) {
                if (rdf.queryAsk(storedQuery("is_property_used", property))) {
                    violationHandler.onViolation("Cannot set fs:inverseRelation for a property that has been used already", stmt);
                }
            }
        });
    }
}
