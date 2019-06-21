package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;

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
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        validateModelAgainstMachineOnlyPredicates(modelToRemove, violationHandler);
        validateModelAgainstMachineOnlyPredicates(modelToAdd, violationHandler);
    }

    /**
     * Ensures that the given model does not contain any machine-only predicates.
     * <p>
     * If the model does contain a machine-only predicate, an IllegalArgumentException is thrown
     *
     * @param model
     */
    private void validateModelAgainstMachineOnlyPredicates(Model model, ViolationHandler violationHandler) {
        machineOnlyProperties.forEach(property -> model.listStatements(null, property, (RDFNode) null)
                .forEachRemaining(statement -> violationHandler.onViolation("The given model contains a machine-only predicate", statement)));
    }
}
