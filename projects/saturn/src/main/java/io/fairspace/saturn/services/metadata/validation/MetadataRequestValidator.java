package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

@FunctionalInterface
public interface MetadataRequestValidator {
    ValidationResult validate(Model modelToRemove, Model modelToAdd);
}
