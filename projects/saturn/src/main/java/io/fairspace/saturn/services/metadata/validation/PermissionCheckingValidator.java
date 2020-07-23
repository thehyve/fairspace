package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.metadata.MetadataPermissions;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final MetadataPermissions permissions;

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        added.listSubjects()
                .andThen(removed.listSubjects())
                .filterDrop(r -> permissions.canWriteMetadata(r.inModel(before)))
                .nextOptional()
                .ifPresent(r -> violationHandler.onViolation("Cannot modify resource", r, null, null));
    }
}
