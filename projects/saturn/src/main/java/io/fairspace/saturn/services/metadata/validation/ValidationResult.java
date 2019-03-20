package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.apache.commons.collections.ListUtils;
import org.apache.commons.lang.StringUtils;

import java.lang.reflect.InvocationTargetException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@AllArgsConstructor
public class ValidationResult {
    public static final ValidationResult VALID = new ValidationResult(true, "");

    private final boolean valid;
    private final String message;
    private final Class<? extends RuntimeException> exceptionClass;
    private final List<String> validationMessages;

    public ValidationResult(boolean valid, String message) {
        this(valid, message, null);
    }

    public ValidationResult(boolean valid, String message, Class<? extends RuntimeException> exceptionClass) {
        this(valid, message, exceptionClass, StringUtils.isEmpty(message) ? Collections.emptyList() : Collections.singletonList(message));
    }

    /**
     * Merges the given validation result with the current one.
     *
     * The merged result:
     * - is valid if both results are valid
     * - contains the current message, or the other message if the current one is empty
     * - contains the current exception class, or the other exception class if the current one is empty
     * - concatenates the other validation messages to the list of validation messages
     * @param other
     * @return
     */
    public ValidationResult merge(ValidationResult other) {
        return new ValidationResult(
                valid && other.valid,
                StringUtils.isEmpty(message) ? other.message : message,
                exceptionClass == null ? other.exceptionClass : exceptionClass,
                Stream.concat(validationMessages.stream(), other.validationMessages.stream())
                        .filter(StringUtils::isNotEmpty)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Returns an exception for the current validation result or null if the result is valid
     * @return
     */
    public RuntimeException generateException() {
        if(exceptionClass != null) {
            try {
                return exceptionClass.getDeclaredConstructor(String.class).newInstance(getMessage());
            } catch (Exception e) {
                // Ignore any exception, as we will throw a default ValidationException instead
            }
        }

        return new ValidationException(getMessage());
    }
}
