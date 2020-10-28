package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

@FunctionalInterface
public interface MetadataRequestValidator {
    void validate(Model before, Model after, Model removed, Model added, ViolationHandler violationHandler);
}
