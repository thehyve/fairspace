package io.fairspace.saturn.services.metadata.validation;

import lombok.SneakyThrows;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.compose.MultiUnion;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.topbraid.shacl.arq.SHACLFunctions;
import org.topbraid.shacl.engine.ShapesGraph;
import org.topbraid.shacl.engine.filters.ExcludeMetaShapesFilter;
import org.topbraid.shacl.util.SHACLSystemModel;
import org.topbraid.shacl.validation.ValidationEngine;
import org.topbraid.shacl.validation.ValidationEngineFactory;
import org.topbraid.shacl.vocabulary.SH;
import org.topbraid.shacl.vocabulary.TOSH;
import org.topbraid.spin.arq.ARQFactory;
import org.topbraid.spin.util.JenaUtil;

import java.net.URI;
import java.util.UUID;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.util.Optional.ofNullable;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

public class ShaclUtil {
    static void addObjectTypes(Model model, Node dataGraph, RDFConnection rdf) {
        model.listObjects().forEachRemaining(obj -> {
            if (obj.isURIResource() && !((Resource)obj).hasProperty(RDF.type)) {
                model.add(rdf.queryConstruct(storedQuery("select_by_mask", dataGraph, obj, RDF.type, null)));
            }
        });
        model.add(rdf.queryConstruct(storedQuery("select_by_mask", dataGraph, null, RDFS.subClassOf, null)));
    }

    public static void getViolations(ValidationEngine validationEngine, ViolationHandler violationHandler) {
         JenaUtil.getAllInstances(SH.ValidationResult.inModel(validationEngine.getReport().getModel()))
                .forEach(shResult -> {
                    if (shResult.hasProperty(SH.resultSeverity, SH.Violation)) {
                        var message = JenaUtil.getStringProperty(shResult, SH.resultMessage);
                        var root = shResult.getPropertyResourceValue(SH.focusNode);
                        var path = ofNullable(shResult.getPropertyResourceValue(SH.resultPath)).map(res -> createProperty(res.getURI())).orElse(null);
                        var value = ofNullable(shResult.getProperty(SH.value)).map(Statement::getObject).orElse(null);
                        violationHandler.onViolation(message, root, path, value);
                    }
                });
    }

    // Copied from org.topbraid.shacl.validation.ValidationUtil.validateModel
    // TODO: Use ValidationUtil.createEngine to be added in SHACL 1.2.
    @SneakyThrows(InterruptedException.class)
    public static ValidationEngine createEngine(Model dataModel, Model shapesModel) {
        // Ensure that the SHACL, DASH and TOSH graphs are present in the shapes Model
        if (!shapesModel.contains(TOSH.hasShape, RDF.type, (RDFNode) null)) { // Heuristic
            Model unionModel = SHACLSystemModel.getSHACLModel();
            MultiUnion unionGraph = new MultiUnion(new Graph[]{
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
        engine.applyEntailments();
        return engine;
    }
}
