package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.util.stream.Stream;

import static io.fairspace.saturn.util.Ref.ref;


public class PermissionCheckingValidator implements MetadataRequestValidator {
    private final PermissionsService permissions;
    private final Vocabulary[] vocabularies;

    public PermissionCheckingValidator(PermissionsService permissions, Vocabulary... vocabularies) {
        this.permissions = permissions;
        this.vocabularies = vocabularies;
    }

    @Override
    public ValidationResult validatePut(Model model) {
        return validateModel(model);
    }

    @Override
    public ValidationResult validateDelete(Model model) {
        return validateModel(model);
    }


    private ValidationResult validateModel(Model model) {
        var result = ref(ValidationResult.VALID);

        model.listStatements().forEachRemaining(stmt -> {
                    result.value = result.value.merge(validateResource(stmt.getSubject()));

                    if (stmt.getObject().isURIResource() &&
                            Stream.of(vocabularies)
                                    .anyMatch(voc -> voc.isInvertiblePredicate(stmt.getPredicate().getURI()))) {
                        result.value = result.value.merge(validateResource(stmt.getResource()));
                    }
                }
        );

        return result.value;
    }

    private ValidationResult validateResource(Resource resource) {
        return permissions.getPermission(resource.asNode()).canWrite()
                ? ValidationResult.VALID
                : new ValidationResult("Cannot modify read-only resource " + resource);
    }
}
