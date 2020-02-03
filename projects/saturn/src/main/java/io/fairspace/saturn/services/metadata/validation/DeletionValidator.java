package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.util.Set;


public class DeletionValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        Set<Node> changed = removed.listSubjects()
                .andThen(added.listSubjects())
                .filterKeep(Resource::isURIResource)
                .mapWith(FrontsNode::asNode)
                .toSet();

        after.listSubjects().filterKeep(res -> res.hasProperty(FS.dateDeleted)).mapWith(FrontsNode::asNode)
                .forEachRemaining(resource -> {
                    if (changed.contains(resource)) {
                        violationHandler.onViolation("Cannot modify deleted resource", resource, null, null);
                    }
                });
    }
}
