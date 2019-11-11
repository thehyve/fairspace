package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.FrontsNode;
import org.apache.jena.rdf.model.Model;

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static java.lang.Thread.currentThread;

public class ShaclValidator implements MetadataRequestValidator {
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affectedNodes = removed.listSubjects()
                .andThen(added.listSubjects())
                .mapWith(FrontsNode::asNode)
                .toSet();
        if (affectedNodes.isEmpty()) {
            return;
        }

        var validationEngine = createEngine(after, vocabulary);
        for(var node: affectedNodes) {
            try {
                validationEngine.validateNode(node);
            } catch (InterruptedException e) {
                currentThread().interrupt();
                throw new RuntimeException("SHACL validation was interrupted", e);
            }
        }
        getViolations(validationEngine, violationHandler);
    }
}
