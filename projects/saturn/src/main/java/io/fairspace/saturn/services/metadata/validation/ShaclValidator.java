package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.InversionUtils.getAffectedResources;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.*;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;
    private final Node dataGraph;
    private final Node vocabularyGraph;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var affectedResources = getAffectedResources(rdf, modelToRemove.union(modelToAdd));

        var modelToValidate = affectedModelSubSet(affectedResources)
                .remove(modelToRemove)
                .add(modelToAdd);

        addObjectTypes(modelToValidate, dataGraph, rdf);

        try {
            var shapesModel = rdf.fetch(vocabularyGraph.getURI());
            var validationEngine = createEngine(modelToValidate, shapesModel);

            for (var resource : affectedResources) {
                validationEngine.validateNode(resource.asNode());
            }

            return getValidationResult(validationEngine);
        } catch (InterruptedException e) {
            throw new RuntimeException("SHACL validation was interrupted");
        }
    }

    /**
     * @param affectedResources
     * @return a model containing all triples describing the affected resources
     */
    private Model affectedModelSubSet(Set<Resource> affectedResources) {
        var model = createDefaultModel();
        affectedResources.forEach(r ->
                model.add(rdf.queryConstruct(storedQuery("select_by_mask", dataGraph, r, null, null))));

        return model;
    }
}
