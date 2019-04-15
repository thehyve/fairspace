package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.OWL;
import org.topbraid.shacl.vocabulary.SH;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@AllArgsConstructor
public class RecomputeInverseInferenceEventHandler implements MetadataUpdateEventHandler{
    private final RDFConnection rdf;
    private final Node graph;

    @Override
    public void onEvent() {
        // Delete all existing inverseOfTriples
        rdf.update(storedQuery("delete_by_mask", graph, null, OWL.inverseOf, null));

        // Retrieve information on sh:path and fs:inverseRelation
        Model shPathModel = rdf.queryConstruct(storedQuery("select_by_mask", graph, null, SH.path, null));
        Model fsInverseRelationModel = rdf.queryConstruct(storedQuery("select_by_mask", graph, null, FS.inverseRelation, null));

        // Load all inverseOfTriples for the given information
        rdf.load(graph.getURI(), generateInverseOfTriples(shPathModel, fsInverseRelationModel));
    }

    private Model generateInverseOfTriples(Model shPathModel, Model fsInverseRelationModel) {
        Model inverseOfTriples = createDefaultModel();
        fsInverseRelationModel.listStatements().forEachRemaining(statement -> {
            if(!statement.getSubject().isURIResource() || !statement.getObject().isURIResource()) {
                return;
            }

            Statement subjectPathStatement = shPathModel.getProperty(statement.getSubject(), SH.path);
            Statement objectPathStatement = shPathModel.getProperty(statement.getResource(), SH.path);

            // No sh:path found for the shapes
            if(subjectPathStatement == null || objectPathStatement == null) {
                return;
            }

            inverseOfTriples.add(subjectPathStatement.getResource(), OWL.inverseOf, objectPathStatement.getResource());
        });
        return inverseOfTriples;
    }
}
