package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.util.Ref.ref;
import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;

public class SystemVocabularyProtectingValidator implements MetadataRequestValidator {
    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ref(ValidationResult.VALID);

        modelToRemove.listStatements().forEachRemaining(statement -> {
            if (SYSTEM_VOCABULARY.contains(statement)) {
                result.value = result.value.merge(new ValidationResult("Cannot modify the system vocabulary: " + statement));
            }
        });

        modelToAdd.listStatements().forEachRemaining(statement -> {
            if (SYSTEM_VOCABULARY.contains(statement.getSubject(), null, (RDFNode) null) && !statement.getPredicate().equals(SH.property)) {
                result.value = result.value.merge(new ValidationResult("Cannot modify the system vocabulary: " + statement));
            }
        });

        return result.value;
    }
}
