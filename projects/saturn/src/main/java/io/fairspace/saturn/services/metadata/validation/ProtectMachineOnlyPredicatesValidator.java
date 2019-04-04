package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.Vocabulary;
import org.apache.jena.rdf.model.Model;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator {
    private Vocabulary vocabulary;

    public ProtectMachineOnlyPredicatesValidator(Vocabulary vocabulary) {
        this.vocabulary = vocabulary;
    }


    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return validateModelAgainstMachineOnlyPredicates(modelToRemove).merge(validateModelAgainstMachineOnlyPredicates(modelToAdd));
    }


    /**
     * Ensures that the given model does not contain any machine-only predicates.
     *
     * If the model does contain a machine-only predicate, an IllegalArgumentException is thrown
     * @param model
     */
    private ValidationResult validateModelAgainstMachineOnlyPredicates(Model model) {
        if (containsMachineOnlyPredicates(model)) {
            return new ValidationResult("The given model contains one or more statements with machine-only predicates.");
        }

        return ValidationResult.VALID;
    }

    /**
     * Verifies whether the given model contains any triples with a machine-only predicate
     *
     * Whether a predicate is machine-only, is specified in the vocabulary.
     * @param model
     * @return true iff the given model contains one or more triples with a machine-only predicate
     */
    boolean containsMachineOnlyPredicates(Model model) {
        if(model == null || model.isEmpty())
            return false;

        var machineOnlyPredicates = vocabulary.getMachineOnlyPredicates();

        // See if any of the predicates is present in the given model
        return machineOnlyPredicates.stream()
                .anyMatch(predicateURI -> model.listResourcesWithProperty(createProperty(predicateURI)).hasNext());
    }
}
