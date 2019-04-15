package io.fairspace.saturn.services.metadata.validation;

import lombok.Data;

import java.util.Set;
import java.util.function.Consumer;

import static com.google.common.collect.Sets.union;
import static io.fairspace.saturn.util.Ref.ref;
import static java.lang.String.join;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static org.apache.commons.lang3.StringUtils.appendIfMissing;

@Data
public class ValidationResult {
    public static final ValidationResult VALID = new ValidationResult(emptySet());

    private final Set<String> validationMessages;

    private ValidationResult(Set<String> validationMessages) {
        this.validationMessages = validationMessages;
    }

    public ValidationResult(String message) {
        this(singleton(appendIfMissing(message, ".")));
    }

    /**
     * Merges the given validation result with the current one.
     *
     * The merged result:
     * - is valid if both results are valid
     * - contains validation messages from both results (without duplicates), preserving the order
     * (we always start with an empty or singleton set, and then merge sets using Sets.union which preserves the order).
     * @param other
     * @return
     */
    public ValidationResult merge(ValidationResult other) {
        return new ValidationResult(union(validationMessages, other.validationMessages));
    }

    public boolean isValid() {
        return validationMessages.isEmpty();
    }

    public String getMessage() {
        return join(" ", validationMessages);
    }

    /*
    ValidationResult mergedValidationResult = mergeValidationResults(onValidationError -> {
      ...
      onValidationError.accept(new ValidationResult("Error"));
      ...
    });
     */
    public static ValidationResult mergeValidationResults(Consumer<Consumer<ValidationResult>> validationAction) {
        var result = ref(VALID);
        validationAction.accept(res -> result.value = result.value.merge(res));
        return result.value;
    }
}
