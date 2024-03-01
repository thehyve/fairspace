package io.fairspace.saturn.util;

import org.junit.Test;

import static io.fairspace.saturn.util.ValidationUtils.validateIRI;

public class ValidationUtilsTest {

    @Test
    public void testValidateValidIRI() {
        validateIRI("http://example.com/path/subpath#bookmark");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testValidateSPARQLInjection() {
        validateIRI(">; INSERT something");
    }
}
