package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;

import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.util.Ref.ref;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
@AllArgsConstructor
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator {
    private final Supplier<List<String>> machineOnlyPredicatesSupplier;


    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        return validateModelAgainstMachineOnlyPredicates(modelToRemove.union(modelToAdd));
    }

    /**
     * Ensures that the given model does not contain any machine-only predicates.
     * <p>
     * If the model does contain a machine-only predicate, an IllegalArgumentException is thrown
     *
     * @param model
     */
    private ValidationResult validateModelAgainstMachineOnlyPredicates(Model model) {
        var result = ref(ValidationResult.VALID);
        var machineOnlyPredicates = machineOnlyPredicatesSupplier.get();

        model.listStatements().forEachRemaining(stmt -> {
            if (machineOnlyPredicates.contains(stmt.getPredicate().getURI())) {
                result.value = result.value.merge(new ValidationResult("The given model contains a machine-only predicate " + stmt.getPredicate().getURI()));
            }
        });

        return result.value;
    }
}
