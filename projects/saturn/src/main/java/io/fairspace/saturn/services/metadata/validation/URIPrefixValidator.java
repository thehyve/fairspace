package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

public class URIPrefixValidator implements MetadataRequestValidator {
    private final String restrictedPrefix;

    public URIPrefixValidator(String restrictedPrefix) {
        this.restrictedPrefix = restrictedPrefix;
    }

    @Override
    public void validate(Model before, Model after, Model removed, Model added, ViolationHandler violationHandler) {
        added.listSubjects()
                .filterKeep(Resource::isURIResource)
                .filterDrop(resource -> before.contains(resource, null))
                .filterKeep(resource -> resource.getURI().startsWith(restrictedPrefix))
                .forEachRemaining(resource -> violationHandler.onViolation(
                        "Cannot add resource with URI starting with restricted prefix '" + restrictedPrefix + "'.",
                        resource,
                        null,
                        null));
    }
}
