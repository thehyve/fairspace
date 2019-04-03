package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;
    private final AffectedResourcesDetector affectedResourcesDetector;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return validateModel(modelToRemove).merge(validateModel(modelToAdd));
    }

    private ValidationResult validateModel(Model model) {
        if (model == null) {
            return ValidationResult.VALID;
        }

        return affectedResourcesDetector.getAffectedResources(model)
                .stream()
                .map(this::validateResource)
                .reduce(ValidationResult.VALID, ValidationResult::merge);
    }

    private ValidationResult validateResource(Resource resource) {
        return permissions.getPermission(resource.asNode()).canWrite()
                ? ValidationResult.VALID
                : new ValidationResult("Cannot modify read-only resource " + resource);
    }
}
