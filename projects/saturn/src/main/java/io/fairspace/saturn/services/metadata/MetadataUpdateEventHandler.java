package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.ValidationResult;
import org.apache.jena.rdf.model.Model;

@FunctionalInterface
public interface MetadataUpdateEventHandler {
    void onEvent();
}
