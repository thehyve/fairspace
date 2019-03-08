package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ComposedValidator implements MetadataRequestValidator{
    private List<MetadataRequestValidator> validators;

    public ComposedValidator(MetadataRequestValidator... validators) {
        this.validators = Arrays.asList(validators);
    }

    @Override
    public ValidationResult validatePut(Model model) {
        return validateComposed(validator -> validator.validatePut(model));
    }

    @Override
    public ValidationResult validatePatch(Model model) {
        return validateComposed(validator -> validator.validatePatch(model));
    }

    @Override
    public ValidationResult validateDelete(Model model) {
        return validateComposed(validator -> validator.validateDelete(model));
    }

    @Override
    public ValidationResult validateDelete(String subject, String predicate, String object) {
        return validateComposed(validator -> validator.validateDelete(subject, predicate, object));
    }

    /**
     * Runs the given validationLogic on each validator and returns the composed result
     * @param validationLogic   Logic to be called on each validator. For example: validator -> validator.validatePut(model)
     */
    ValidationResult validateComposed(Function<MetadataRequestValidator, ValidationResult> validationLogic) {
        ValidationResult composedValidationResult = ValidationResult.VALID;

        for(MetadataRequestValidator validator: validators) {
            ValidationResult validationResult = validationLogic.apply(validator);
            if(!validationResult.isValid()) {
                composedValidationResult = composedValidationResult.merge(validationResult);
            }
        }

        return composedValidationResult;
    }

}
