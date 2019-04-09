package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.services.metadata.validation.InversionUtils.getAffectedResources;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;
    private final PermissionsService permissions;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return getAffectedResources(rdf, modelToRemove.union(modelToAdd))
                .stream()
                .filter(Resource::isURIResource)
                .map(this::validateResource)
                .reduce(ValidationResult.VALID, ValidationResult::merge);
    }

    private ValidationResult validateResource(Resource resource) {
        return permissions.getPermission(resource.asNode()).canWrite()
                ? ValidationResult.VALID
                : new ValidationResult("Cannot modify read-only resource " + resource);
    }
}
