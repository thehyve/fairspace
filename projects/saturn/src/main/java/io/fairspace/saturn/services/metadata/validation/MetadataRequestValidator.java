package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

@FunctionalInterface
public interface MetadataRequestValidator {
    void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler, RDFConnection rdf);
}
