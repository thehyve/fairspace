package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static java.lang.Thread.currentThread;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {

    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affectedResources = removed.listSubjects()
                .andThen(added.listSubjects())
                .toSet();

        var validationEngine = createEngine(after, vocabulary);

        try {
            for (var resource : affectedResources) {
                validationEngine.validateNode(resource.asNode());
            }
        } catch (InterruptedException e) {
            currentThread().interrupt();
            throw new RuntimeException("SHACL validation was interrupted");
        }

        getViolations(validationEngine, violationHandler);
    }
}
