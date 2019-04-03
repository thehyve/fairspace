package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.compose.MultiUnion;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.arq.SHACLFunctions;
import org.topbraid.shacl.engine.ShapesGraph;
import org.topbraid.shacl.engine.filters.ExcludeMetaShapesFilter;
import org.topbraid.shacl.util.SHACLSystemModel;
import org.topbraid.shacl.validation.ValidationEngine;
import org.topbraid.shacl.validation.ValidationEngineFactory;
import org.topbraid.shacl.vocabulary.TOSH;
import org.topbraid.spin.arq.ARQFactory;
import org.topbraid.spin.constraints.ConstraintViolation;

import java.net.URI;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.lang.String.format;
import static java.util.stream.Collectors.joining;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.topbraid.shacl.util.SHACL2SPINBridge.createConstraintViolations;

@AllArgsConstructor
public class ShaclValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;
    private final Node dataGraph;
    private final Node shapesGraph;
    private final Function<Model, Set<Resource>> affectedResourcesDetector;

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
        var validationEngine = createEngine(model, shapesModel);

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
                .map(ShaclValidator::toValidationResult)
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

    private static ValidationResult toValidationResult(ConstraintViolation violation) {
        return new ValidationResult(format("%s %s: %s",
                violation.getRoot().getURI(),
                violation.getPaths().stream().map(path -> path.getPredicate().toString()).collect(joining(", ")),
                violation.getMessage()));
    }

    // Copied from org.topbraid.shacl.validation.ValidationUtil.validateModel
    // TODO: Use ValidationUtil.createEngine to be added in SHACL 1.2.0
    private ValidationEngine createEngine(Model dataModel, Model shapesModel) {
        // Ensure that the SHACL, DASH and TOSH graphs are present in the shapes Model
        if(!shapesModel.contains(TOSH.hasShape, RDF.type, (RDFNode)null)) { // Heuristic
            Model unionModel = SHACLSystemModel.getSHACLModel();
            MultiUnion unionGraph = new MultiUnion(new Graph[] {
                    unionModel.getGraph(),
                    shapesModel.getGraph()
            });
            shapesModel = ModelFactory.createModelForGraph(unionGraph);
        }

        // Make sure all sh:Functions are registered
        SHACLFunctions.registerFunctions(shapesModel);

        // Create Dataset that contains both the data model and the shapes model
        // (here, using a temporary URI for the shapes graph)
        URI shapesGraphURI = URI.create("urn:x-shacl-shapes-graph:" + UUID.randomUUID().toString());
        Dataset dataset = ARQFactory.get().getDataset(dataModel);
        dataset.addNamedModel(shapesGraphURI.toString(), shapesModel);

        ShapesGraph shapesGraph = new ShapesGraph(shapesModel);
            shapesGraph.setShapeFilter(new ExcludeMetaShapesFilter());
        ValidationEngine engine = ValidationEngineFactory.get().create(dataset, shapesGraphURI, shapesGraph, null);
        try {
            engine.applyEntailments();
            return engine;
        }
        catch(InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
