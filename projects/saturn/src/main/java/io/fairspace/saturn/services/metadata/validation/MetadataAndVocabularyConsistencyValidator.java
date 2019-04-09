package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDFS;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.lang.String.format;

/**
 * Prohibits any modification of vocabulary resources used in metadata, except to a few whitelisted properties
 */
@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private static final Set<Property> WHITE_LISTED_PROPERTIES = Set.of(RDFS.label, RDFS.comment, SH.property);

    private final RDFConnection rdf;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ValidationResult.VALID;
        for (var it = modelToRemove.union(modelToAdd).listStatements(); it.hasNext(); ) {
            var stmt = it.next();
            if (!WHITE_LISTED_PROPERTIES.contains(stmt.getPredicate()) && isUsed(stmt.getSubject())) {
                result = result.merge(new ValidationResult(format("Resource %s has been used in metadata and cannot be altered", stmt.getSubject())));
            }
        }
        return result;
    }

    private boolean isUsed(Resource resource) {
        return resource.isURIResource() && rdf.queryAsk(storedQuery("is_used", resource.asNode()));
    }
}
