package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.util.Set;
import java.util.function.Function;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;
    private final Function<Model, Set<Resource>> affectedResourcesDetector;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return validateModel(modelToRemove).merge(validateModel(modelToAdd));
    }

    private ValidationResult validateModel(Model model) {
        return affectedResourcesDetector.apply(model)
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
