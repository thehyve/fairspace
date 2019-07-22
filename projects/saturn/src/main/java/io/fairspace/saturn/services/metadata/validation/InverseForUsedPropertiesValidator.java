package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.util.Optional.ofNullable;

/**
 * Ensures that no changes are made to fs:inverseRelation in the vocabulary that
 * would break the metadata validity.
 *
 * More specifically, it will disallow additions of fs:inverseRelation where the specific
 * property has already been used in the metadata.
 */
@AllArgsConstructor
public class InverseForUsedPropertiesValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        added.listStatements(null, FS.inverseRelation, (RDFNode) null).forEachRemaining(stmt -> {
            var shape = stmt.getSubject();
            var property = shape.getPropertyResourceValue(SH.path);
            var domain = ofNullable(shape.getPropertyResourceValue(FS.domainIncludes))
                    .map(domainShape -> domainShape.getPropertyResourceValue(SH.targetClass))
                    .orElse(null);

            if (property != null && domain != null) {
                if (rdf.queryAsk(storedQuery("is_property_used", property, domain))) {
                    violationHandler.onViolation("Cannot set fs:inverseRelation for a property that has been used already", stmt);
                }
            }
        });
    }
}
