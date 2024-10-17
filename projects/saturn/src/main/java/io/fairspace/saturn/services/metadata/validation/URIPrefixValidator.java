package io.fairspace.saturn.services.metadata.validation;

import com.google.common.annotations.VisibleForTesting;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import io.fairspace.saturn.webdav.DavFactory;

@Component
public class URIPrefixValidator implements MetadataRequestValidator {

    private final String restrictedPrefix;

    @Autowired
    public URIPrefixValidator(@Qualifier("davFactory") DavFactory davFactory) {
        this.restrictedPrefix = ((io.milton.resource.Resource) davFactory.root).getUniqueId();
    }

    @VisibleForTesting
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
