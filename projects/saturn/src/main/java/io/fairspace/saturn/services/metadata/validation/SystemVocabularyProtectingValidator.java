package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;

/**
 * Protects the system vocabulary from modification except to addition of new properties to open class shapes
 */
public class SystemVocabularyProtectingValidator implements MetadataRequestValidator {
    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ValidationResult.VALID;

        for (var it = modelToRemove.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement)) {
                result = result.merge(new ValidationResult("Cannot remove a statement from the system vocabulary: " + statement));
            }
        }

        for (var it = modelToAdd.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement.getSubject(), null, (RDFNode) null)
                    && !statement.getPredicate().equals(SH.property)) {
                result = result.merge(new ValidationResult("Cannot add a statement modifying a shape from the system vocabulary: " + statement));
            }
        }

        return result;
    }
}
