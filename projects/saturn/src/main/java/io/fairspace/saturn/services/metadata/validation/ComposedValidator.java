package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

/**
 * Combines a few validators into one. Stops on a first failing validator.
 */
public class ComposedValidator implements MetadataRequestValidator {
    private MetadataRequestValidator[] validators;

    public ComposedValidator(MetadataRequestValidator... validators) {
        this.validators = validators;
    }

    /**
     * Executes each validator and returns the composed result
     */
    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        var violationHandlerWrapper = new ViolationHandlerWrapper(violationHandler);
        for (var validator: validators) {
            validator.validate(modelToRemove, modelToAdd, violationHandlerWrapper);
            if (violationHandlerWrapper.hasViolations) {
                break;
            }
        }
    }

    private static class ViolationHandlerWrapper implements ViolationHandler {
        private final ViolationHandler violationHandler;
        private boolean hasViolations;

        private ViolationHandlerWrapper(ViolationHandler violationHandler) {
            this.violationHandler = violationHandler;
        }

        @Override
        public void onViolation(String message, Resource subject, Property predicate, RDFNode object) {
            hasViolations = true;
            violationHandler.onViolation(message, subject, predicate, object);
        }
    }
}
