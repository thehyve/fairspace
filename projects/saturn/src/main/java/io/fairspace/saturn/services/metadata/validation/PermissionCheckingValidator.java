package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.MetadataAccessDeniedException;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;

import static org.apache.jena.rdf.model.ResourceFactory.createResource;

@AllArgsConstructor
public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        try {
            validateRemoved(removed, before);
            validateAdded(added);
        } catch (MetadataAccessDeniedException e) {
            violationHandler.onViolation("Cannot modify resource", createResource(e.getSubject().getURI()), null, null);
        }
    }

    private void validateRemoved(Model removed, Model before) {
        removed.listStatements()
                .filterDrop(statement -> (isWorkspaceProperty(before, statement))
                        && !statement.getPredicate().equals(FS.status))
                .mapWith(Statement::getSubject)
                .filterKeep(Resource::isURIResource)
                .mapWith(FrontsNode::asNode)
                .forEachRemaining(permissions::ensureAdminAccess);

        permissions.ensureAccess(
                removed.listStatements()
                        .filterKeep(statement -> (isWorkspaceProperty(before, statement)
                                && !statement.getPredicate().equals(FS.status)))
                        .mapWith(Statement::getSubject)
                        .filterKeep(Resource::isURIResource)
                        .mapWith(FrontsNode::asNode)
                        .toSet(),
                Access.Manage
        );
    }

    private void validateAdded(Model added) {
        added.listSubjectsWithProperty(FS.status)
                .filterKeep(Resource::isURIResource)
                .mapWith(FrontsNode::asNode)
                .forEachRemaining(permissions::ensureAdminAccess);

        permissions.ensureAccess(
                added.listSubjects()
                        .filterDrop(s -> s.hasProperty(FS.status))
                        .filterKeep(Resource::isURIResource)
                        .mapWith(FrontsNode::asNode)
                        .toSet(),
                Access.Write
        );
    }

    private boolean isWorkspaceProperty(Model model, Statement statement) {
        return statement.getSubject().inModel(model).hasProperty(RDF.type, FS.Workspace);
    }
}
