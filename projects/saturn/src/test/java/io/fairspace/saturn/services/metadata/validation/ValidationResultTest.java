package io.fairspace.saturn.services.metadata.validation;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ValidationResultTest {
    @Test
    public void testMergeValidProperty() {
        ValidationResult valid = ValidationResult.VALID;
        ValidationResult failure = new ValidationResult(false, "");

        assertEquals(true, valid.merge(valid).isValid());
        assertEquals(false, valid.merge(failure).isValid());
        assertEquals(false, failure.merge(valid).isValid());
        assertEquals(false, failure.merge(failure).isValid());
    }

    @Test
    public void testMergeMessageProperty() {
        ValidationResult defaultValid = ValidationResult.VALID;
        ValidationResult success = new ValidationResult(true, "Succesful message");
        ValidationResult failure = new ValidationResult(false, "Other message");

        // Keep first message by default
        assertEquals(success.getMessage(), success.merge(failure).getMessage());

        // Overwrite first message if empty
        assertEquals(success.getMessage(), defaultValid.merge(success).getMessage());
    }

    @Test
    public void testMergeValidationMessages() {
        ValidationResult defaultValid = ValidationResult.VALID;
        ValidationResult success = new ValidationResult(true, "Succesful message");
        ValidationResult failure = new ValidationResult(false, "Other message");

        // Both messages should be kept when merging
        ValidationResult merged = success.merge(failure);
        assertEquals(2, merged.getValidationMessages().size());
        assertEquals(success.getMessage(), merged.getValidationMessages().get(0));
        assertEquals(failure.getMessage(), merged.getValidationMessages().get(1));

        // Any empty message should be discarded
        merged = defaultValid.merge(success);
        assertEquals(1, merged.getValidationMessages().size());
        assertEquals(success.getMessage(), merged.getValidationMessages().get(0));

        // Duplicate messages should not be combined
        merged = success.merge(success);
        assertEquals(2, merged.getValidationMessages().size());
        assertEquals(success.getMessage(), merged.getValidationMessages().get(0));
        assertEquals(success.getMessage(), merged.getValidationMessages().get(1));

    }

}
