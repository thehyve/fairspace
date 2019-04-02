package io.fairspace.saturn.services.metadata.validation;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ComposedValidatorTest {
    @Mock
    MetadataRequestValidator validator1;

    @Mock
    MetadataRequestValidator validator2;

    ComposedValidator validator;

    @Before
    public void setUp() throws Exception {
        validator = new ComposedValidator(validator1, validator2);
    }

    @Test
    public void testValidateComposed() {
        testCombination(true, true, true);
        testCombination(true, false, false);
        testCombination(false, true, false);
        testCombination(false, false, false);
    }

    private void testCombination(boolean validity1, boolean validity2, boolean expectedResult) {
        reset(validator1, validator2);

        doReturn(validity1 ? ValidationResult.VALID : new ValidationResult("test")).when(validator1).validatePut(any());
        doReturn(validity2 ? ValidationResult.VALID : new ValidationResult("test")).when(validator2).validatePut(any());

        ValidationResult result = validator.validateComposed(validator -> validator.validatePut(null));

        assertEquals(expectedResult, result.isValid());
        verify(validator1).validatePut(any());
        verify(validator2).validatePut(any());

    }
}
