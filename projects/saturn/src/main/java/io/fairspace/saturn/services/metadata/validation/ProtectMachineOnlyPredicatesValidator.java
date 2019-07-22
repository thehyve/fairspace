package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;

import static io.fairspace.saturn.vocabulary.Inference.getPropertyShapeForStatement;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator {
    private final List<Property> machineOnlyProperties;

    public ProtectMachineOnlyPredicatesValidator(Model vocabulary) {
        this.machineOnlyProperties = vocabulary
                .listSubjectsWithProperty(SH.path)
                .filterKeep(shape -> shape.hasLiteral(FS.machineOnly, true))
                .mapWith(shape -> createProperty(shape.getPropertyResourceValue(SH.path).getURI()))
                .toList();
    }

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
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
