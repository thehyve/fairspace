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
import static io.fairspace.saturn.util.Ref.ref;
import static java.lang.String.format;

@AllArgsConstructor
public class MetadataAndVocabularyConsistencyValidator implements MetadataRequestValidator {
    private static final Set<Property> WHITE_LISTED_PROPERTIES = Set.of(RDFS.label, RDFS.comment, SH.property);

    private final RDFConnection rdf;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var result = ref(ValidationResult.VALID);
        modelToRemove.union(modelToAdd)
                .listStatements()
                .forEachRemaining(stmt -> {
                    if (!WHITE_LISTED_PROPERTIES.contains(stmt.getPredicate()) && isUsed(stmt.getSubject())) {
                        result.value = result.value.merge(new ValidationResult(format("Resource %s has been used in metadata and cannot be altered", stmt.getSubject())));
                    }
                });
        return result.value;
    }

    private boolean isUsed(Resource resource) {
        return resource.isURIResource() && rdf.queryAsk(storedQuery("is_used", resource.asNode()));
    }
}
