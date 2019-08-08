package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;

/**
 * Protects the system vocabulary from modification except to addition of new properties to open class shapes
 */
public class SystemVocabularyProtectingValidator implements MetadataRequestValidator {
    private static final Set<?> ALLOWED_PREDICATES = Set.of(SH.property, FS.domainIncludes);

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        removed.listStatements()
                .filterKeep(SYSTEM_VOCABULARY::contains)
                .forEachRemaining(statement -> violationHandler.onViolation("Cannot remove a statement from the system vocabulary", statement));

        added.listStatements()
                .filterKeep(statement -> SYSTEM_VOCABULARY.contains(statement.getSubject(), null))
                .filterDrop(statement -> ALLOWED_PREDICATES.contains(statement.getPredicate()))
                .forEachRemaining(statement -> violationHandler.onViolation("Cannot add a statement modifying a shape from the system vocabulary", statement));
    }
}
