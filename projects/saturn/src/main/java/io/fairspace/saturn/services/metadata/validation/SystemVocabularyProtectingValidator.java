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
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        for (var it = removed.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement)) {
                violationHandler.onViolation("Cannot remove a statement from the system vocabulary", statement);
            }
        }

        for (var it = added.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement.getSubject(), null, (RDFNode) null)
                    && !statement.getPredicate().equals(SH.property)) {
                violationHandler.onViolation("Cannot add a statement modifying a shape from the system vocabulary", statement);
            }
        }
    }
}
