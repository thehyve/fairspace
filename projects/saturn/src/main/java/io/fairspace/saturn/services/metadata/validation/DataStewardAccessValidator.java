package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.services.users.UserService;
import org.apache.jena.rdf.model.Model;

import java.util.List;
import java.util.function.Supplier;

/**
 * This validator checks whether the current user has data-steward role
 * and will fail if not
 */
public class DataStewardAccessValidator implements MetadataRequestValidator{
    private String dataStewardRole;
    private Supplier<UserInfo> userInfoSupplier;

    public DataStewardAccessValidator(String dataStewardRole, Supplier<UserInfo> userInfoSupplier) {
        this.dataStewardRole = dataStewardRole;
        this.userInfoSupplier = userInfoSupplier;
    }

    @Override
    public ValidationResult validatePut(Model model) {
        return validateDataSteward();
    }

    @Override
    public ValidationResult validatePatch(Model model) {
        return validateDataSteward();
    }

    @Override
    public ValidationResult validateDelete(Model model) {
        return validateDataSteward();
    }

    @Override
    public ValidationResult validateDelete(String subject, String predicate, String object) {
        return validateDataSteward();
    }

    private ValidationResult validateDataSteward() {
        UserInfo userInfo = userInfoSupplier.get();
        if(userInfo == null || !userInfo.getAuthorities().contains(dataStewardRole)) {
            return new ValidationResult(false, "Vocabulary updates are only allowed by data stewards", ForbiddenException.class );
        }

        return ValidationResult.VALID;
    }
}
