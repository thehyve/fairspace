package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.shacl.vocabulary.SHACLM;

import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;

/**
 * Protects the system vocabulary from modification except to addition of new properties to open class shapes
 */
public class SystemVocabularyProtectingValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        removed.listStatements()
                .filterKeep(SYSTEM_VOCABULARY::contains)
                .forEachRemaining(statement -> violationHandler.onViolation("Cannot remove a statement from the system vocabulary", statement));

        added.listStatements()
                .filterKeep(statement -> SYSTEM_VOCABULARY.contains(statement.getSubject(), null))
                .filterDrop(statement -> statement.getPredicate().equals(SHACLM.property))
                .forEachRemaining(statement -> {
                    if (statement.getPredicate().equals(FS.domainIncludes)) {
                        if (SYSTEM_VOCABULARY.contains(statement.getSubject(), FS.machineOnly, createTypedLiteral(true))) {
                            violationHandler.onViolation("Cannot add a machine-only property", statement);
                        }
                    } else {
                        violationHandler.onViolation("Cannot add a statement modifying a shape from the system vocabulary", statement);
                    }
                });
    }
}
