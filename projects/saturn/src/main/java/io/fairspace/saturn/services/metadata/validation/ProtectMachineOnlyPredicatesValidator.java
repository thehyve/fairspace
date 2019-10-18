package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.vocabulary.Inference.getPropertyShapeForStatement;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator {

    public ProtectMachineOnlyPredicatesValidator() {
    }

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler, RDFConnection rdf) {
        validateModelAgainstMachineOnlyPredicates(removed, vocabulary, violationHandler);
        validateModelAgainstMachineOnlyPredicates(added, vocabulary, violationHandler);

    }

    private void validateModelAgainstMachineOnlyPredicates(Model diff, Model vocabulary, ViolationHandler violationHandler) {
        diff.listStatements()
                .forEachRemaining(statement -> getPropertyShapeForStatement(statement, vocabulary)
                        .filter(propertyShape -> propertyShape.hasLiteral(FS.machineOnly, true))
                        .ifPresent(ps -> violationHandler.onViolation("The given model contains a machine-only predicate", statement)));
    }
}
