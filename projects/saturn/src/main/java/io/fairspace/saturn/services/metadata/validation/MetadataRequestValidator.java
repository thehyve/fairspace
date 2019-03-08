package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

public interface MetadataRequestValidator {
    ValidationResult validatePut(Model model);
    ValidationResult validatePatch(Model model);
    ValidationResult validateDelete(Model model);
    ValidationResult validateDelete(String subject, String predicate, String object);
}
