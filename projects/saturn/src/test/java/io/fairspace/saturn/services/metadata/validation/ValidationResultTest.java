package io.fairspace.saturn.services.metadata.validation;

import org.junit.Test;

import static org.junit.Assert.*;

public class ValidationResultTest {
    @Test
    public void testMergeValidProperty() {
        var valid = ValidationResult.VALID;
        var failure = new ValidationResult("failure");

        assertTrue(valid.merge(valid).isValid());
        assertFalse(valid.merge(failure).isValid());
        assertFalse(failure.merge(valid).isValid());
        assertFalse(failure.merge(failure).isValid());
    }


    @Test
    public void testMergeValidationMessages() {
        var error1 = new ValidationResult("Error 1");
        var error2 = new ValidationResult("Error 2");
        var error3 = new ValidationResult("Error 3");

        // Valid is the group's union
        assertEquals(ValidationResult.VALID, ValidationResult.VALID.merge(ValidationResult.VALID));
        assertEquals(error1, error1.merge(ValidationResult.VALID));
        assertEquals(error1, ValidationResult.VALID.merge(error1));

        // Is commutative
        assertEquals(error1.merge(error2), error2.merge(error1));

        // Is associative
        assertEquals((error1.merge(error2)).merge(error3), error1.merge(error2.merge(error3)));

        // Is idempotent
        assertEquals(error1.merge(error2), error1.merge(error2).merge(error2));

        // All messages are kept
        var merged = ValidationResult.VALID.merge(error1).merge(error2).merge(error3);
        assertEquals(3, merged.getValidationMessages().size());
        assertTrue(merged.getValidationMessages().contains(error1.getMessage()));
        assertTrue(merged.getValidationMessages().contains(error2.getMessage()));
        assertTrue(merged.getValidationMessages().contains(error3.getMessage()));
        assertEquals("Error 1. Error 2. Error 3.", merged.getMessage());
    }

}
