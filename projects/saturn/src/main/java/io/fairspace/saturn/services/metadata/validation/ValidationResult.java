package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.apache.commons.collections.ListUtils;
import org.apache.commons.lang.StringUtils;

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
    private final List<String> validationMessages;

    public ValidationResult(boolean valid, String message) {
        this(valid, message, StringUtils.isEmpty(message) ? Collections.emptyList() : Collections.singletonList(message));
    }

    /**
     * Merges the given validation result with the current one.
     *
     * The merged result:
     * - is valid if both results are valid
     * - contains the current message, or the other message if the current one is empty
     * - concatenates the other validation messages to the list of validation messages
     * @param other
     * @return
     */
    public ValidationResult merge(ValidationResult other) {
        return new ValidationResult(
                valid && other.valid,
                StringUtils.isEmpty(message) ? other.message : message,
                Stream.concat(validationMessages.stream(), other.validationMessages.stream())
                        .filter(StringUtils::isNotEmpty)
                        .collect(Collectors.toList())
        );
    }
}
