package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.Graph;
import org.apache.jena.graph.compose.MultiUnion;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.arq.SHACLFunctions;
import org.topbraid.shacl.engine.ShapesGraph;
import org.topbraid.shacl.engine.filters.ExcludeMetaShapesFilter;
import org.topbraid.shacl.util.SHACLSystemModel;
import org.topbraid.shacl.validation.ValidationEngine;
import org.topbraid.shacl.validation.ValidationEngineFactory;
import org.topbraid.shacl.vocabulary.TOSH;
import org.topbraid.spin.arq.ARQFactory;

import java.net.URI;
import java.util.UUID;

public class ShaclValidationEngineFactory {
    // Copied from org.topbraid.shacl.validation.ValidationUtil.validateModel
    // TODO: Use ValidationUtil.createEngine to be added in SHACL 1.2.0
    public static ValidationEngine createEngine(Model dataModel, Model shapesModel) {
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
