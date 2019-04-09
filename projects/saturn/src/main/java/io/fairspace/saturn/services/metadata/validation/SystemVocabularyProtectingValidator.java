package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.*;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;

public class SystemVocabularyProtectingValidator implements MetadataRequestValidator {

    private static final Property CLOSED = createProperty(SH.NS + "closed");

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ValidationResult.VALID;

        for (var it = modelToRemove.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement)) {
                result = result.merge(reportStatement(statement));
            }
        }

        for (var it = modelToAdd.listStatements(); it.hasNext(); ) {
            var statement = it.nextStatement();
            if (SYSTEM_VOCABULARY.contains(statement.getSubject(), null, (RDFNode) null)
                    && (!statement.getPredicate().equals(SH.property) || isClosed(statement.getSubject()))) {
                result = result.merge(reportStatement(statement));
            }
        }

        return result;
    }

    private static boolean isClosed(Resource subject) {
        return SYSTEM_VOCABULARY.contains(subject, CLOSED, createTypedLiteral(true));
    }

    private ValidationResult reportStatement(Statement statement) {
        return new ValidationResult("Cannot modify the system vocabulary: " + statement);
    }
}
