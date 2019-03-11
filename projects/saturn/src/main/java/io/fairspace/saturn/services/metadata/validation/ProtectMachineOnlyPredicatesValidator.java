package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.Vocabulary;
import org.apache.jena.rdf.model.Model;

import java.util.List;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator{
    private Vocabulary vocabulary;

    public ProtectMachineOnlyPredicatesValidator(Vocabulary vocabulary) {
        this.vocabulary = vocabulary;
    }

    @Override
    public ValidationResult validatePut(Model model) {
        return validateModelAgainstMachineOnlyPredicates(model);
    }

    @Override
    public ValidationResult validatePatch(Model model) {
        return validateModelAgainstMachineOnlyPredicates(model);
    }

    @Override
    public ValidationResult validateDelete(Model model) {
        return validateModelAgainstMachineOnlyPredicates(model);
    }

    @Override
    public ValidationResult validateDelete(String subject, String predicate, String object) {
        if (predicate != null && vocabulary.isMachineOnlyPredicate(predicate)) {
            return new ValidationResult(false, "The given predicate is marked as machine-only. It cannot be used directly.");
        }

        return ValidationResult.VALID;
    }

    /**
     * Ensures that the given model does not contain any machine-only predicates.
     *
     * If the model does contain a machine-only predicate, an IllegalArgumentException is thrown
     * @param model
     */
    private ValidationResult validateModelAgainstMachineOnlyPredicates(Model model) {
        if (containsMachineOnlyPredicates(model)) {
            return new ValidationResult(false, "The given model contains one or more statements with machine-only predicates. This is not allowed.");
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

        List<String> machineOnlyPredicates = vocabulary.getMachineOnlyPredicates();

        // See if any of the predicates is present in the given model
        return machineOnlyPredicates.stream()
                .anyMatch(predicateURI -> model.listResourcesWithProperty(model.createProperty(predicateURI)).hasNext());
    }
}
