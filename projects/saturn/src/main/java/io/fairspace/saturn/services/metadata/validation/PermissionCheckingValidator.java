package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.MetadataAccessDeniedException;
import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

import java.util.stream.Collectors;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;

    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        try {
            permissions.ensureAccess(
                    modelToRemove.union(modelToAdd)
                            .listSubjects()
                            .toSet()
                            .stream()
                            .filter(Resource::isURIResource)
                            .map(FrontsNode::asNode)
                            .collect(Collectors.toSet()),
                    Access.Write
            );
        } catch(MetadataAccessDeniedException e) {
            violationHandler.onViolation("Cannot modify read-only resource" , ResourceFactory.createResource(e.getSubject().getURI()), null, null);
        }
    }
}
