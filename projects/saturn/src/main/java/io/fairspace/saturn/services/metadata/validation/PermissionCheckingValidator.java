package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;

    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        modelToRemove.union(modelToAdd)
                .listSubjects()
                .toSet()
                .stream()
                .filter(Resource::isURIResource)
                .forEach(resource -> {
                    if(!permissions.getPermission(resource.asNode()).canWrite()) {
                        violationHandler.onViolation("Cannot modify read-only resource " + resource, resource, null, null);
                    }
                });
    }
}
