package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

import java.util.List;

import static java.util.Arrays.asList;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ComposedValidator implements MetadataRequestValidator{
    private List<MetadataRequestValidator> validators;

    public ComposedValidator(MetadataRequestValidator... validators) {
        this.validators = asList(validators);
    }

    /**
     * Executes each validator and returns the composed result
     */
    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return validators.stream()
                .map(v -> v.validate(modelToRemove, modelToAdd))
                .reduce(ValidationResult.VALID, ValidationResult::merge);
    }
}
