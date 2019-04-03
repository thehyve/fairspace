package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.topbraid.shacl.validation.ValidationEngine;
import org.topbraid.spin.constraints.ConstraintViolation;

import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.topbraid.shacl.util.SHACL2SPINBridge.createConstraintViolations;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;
    private final Node dataGraph;
    private final Node shapesGraph;
    private final Function<Model, Set<Resource>> affectedResourcesDetector;
    private final BiFunction<Model, Model, ValidationEngine> validationEngineFactory;

    @Override
    public ValidationResult validate(Model modelToRemove, Model modelToAdd) {
        var affectedResources = affectedResourcesDetector.apply(modelToRemove);
        affectedResources.addAll(affectedResourcesDetector.apply(modelToAdd));

        var model = targetModel(affectedResources);
        if (modelToRemove != null) {
            model.remove(modelToRemove);
        }
        if (modelToAdd != null) {
            model.add(modelToAdd);
        }

        var shapesModel = rdf.queryConstruct(storedQuery("select_by_mask", shapesGraph, null, null, null));
        var validationEngine = validationEngineFactory.apply(model, shapesModel);

        for (var resource: affectedResources) {
            try {
                validationEngine.validateNode(resource.asNode());
            } catch (InterruptedException e) {
                return new ValidationResult("SHACL validation was interrupted");
            }
        }

        var report = validationEngine.getReport();
        var violations = createConstraintViolations(report.getModel());

        return violations.stream()
                .filter(ConstraintViolation::isError)
                .map(violation -> new ValidationResult(violation.getRoot().getURI() + ": " + violation.getMessage()))
                .reduce(ValidationResult.VALID, ValidationResult::merge);
    }

    /**
     * @param affectedResources
     * @return a model containing all triples describing the affected resources plus types (rdf:type) of the objects
     */
    private Model targetModel(Set<Resource> affectedResources) {
        var model = createDefaultModel();
        affectedResources.forEach(r ->
                model.add(rdf.queryConstruct(storedQuery("select_by_mask_with_types", dataGraph, r.asNode(), null, null))));
        return model;
    }
}
