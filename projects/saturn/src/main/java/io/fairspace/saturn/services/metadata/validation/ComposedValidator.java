package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;

/**
 * Combines a few validators into one. Stops on a first failing validator.
 */
public class ComposedValidator implements MetadataRequestValidator {
    private final MetadataRequestValidator[] validators;

    public ComposedValidator(MetadataRequestValidator... validators) {
        this.validators = validators;
    }

    /**
     * Executes each validator and returns the composed result
     */
    @Override
    public void validate(Model before, Model after, Model removed, Model added, ViolationHandler violationHandler) {
        var violationHandlerWrapper = new ViolationHandlerWrapper(violationHandler);
        for (var validator : validators) {
            validator.validate(before, after, removed, added, violationHandlerWrapper);
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
        public void onViolation(String message, Node subject, Node predicate, Node object) {
            hasViolations = true;
            violationHandler.onViolation(message, subject, predicate, object);
        }
    }
}
