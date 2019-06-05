package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.addObjectTypes;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static java.lang.Thread.currentThread;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;
    private final Node dataGraph;
    private final Node vocabularyGraph;

    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        var affectedResources = modelToRemove.listSubjects()
                .andThen(modelToAdd.listSubjects())
                .filterKeep(Resource::isURIResource)
                .toSet();

        var modelToValidate = affectedModelSubSet(affectedResources)
                .remove(modelToRemove)
                .add(modelToAdd);

        addObjectTypes(modelToValidate, dataGraph, rdf);

        var shapesModel = rdf.fetch(vocabularyGraph.getURI());
        var validationEngine = createEngine(modelToValidate, shapesModel);

        modelToValidate.listSubjects().forEachRemaining(resource -> {
            try {
                validationEngine.validateNode(resource.asNode());
            } catch (InterruptedException e) {
                currentThread().interrupt();
                throw new RuntimeException("SHACL validation was interrupted");
            }
        });

        getViolations(validationEngine, violationHandler);
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
