package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;

/**
 * This validator checks whether the requested action will modify any predicates
 * of inactive workspace other than workspace status. If so, the request will not validate
 */
public class WorkspaceStatusValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        removed.listStatements()
                .andThen(added.listStatements())
                .filterKeep(statement -> statement.getSubject().isURIResource())
                .filterKeep(statement -> {
                    Resource r = statement.getSubject().inModel(before);
                    return r.hasProperty(RDF.type, FS.Workspace) && !r.hasProperty(FS.status, WorkspaceStatus.Active.name());
                })
                .filterDrop(statement -> statement.getPredicate().equals(FS.status))
                .forEachRemaining(statement ->
                                violationHandler.onViolation("Cannot modify inactive resource", statement.getSubject(), null, null)
                );
    }
}
