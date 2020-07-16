package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.shacl.vocabulary.SHACLM;

import static io.fairspace.saturn.vocabulary.Inference.getPropertyShapesForResource;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ReadableMetadataService {
    protected final Transactions transactions;
    protected final Node graph;
    protected final Node vocabulary;

    public ReadableMetadataService(Transactions transactions, Node graph, Node vocabulary) {
        this.transactions = transactions;
        this.graph = graph;
        this.vocabulary = vocabulary;
    }

    /**
     * Returns a model with statements from the metadata database, based on the given selection criteria
     * <p>
     * If any of the fields is null, that field is not included to filter statements. For example, if only
     * subject is given and predicate and object are null, then all statements with the given subject will be returned.
     *
     * @param subject              Subject URI for which you want to return statements
     * @param withObjectProperties If set to true, the returned model will also include statements specifying values for
     *                             certain properties marked as fs:importantProperty in the vocabulary
     * @return
     */
    Model get(String subject, boolean withObjectProperties) {
        var model = createDefaultModel();

        transactions.executeRead(dataset -> {
            var voc = withObjectProperties ? dataset.getNamedModel(vocabulary.getURI()) : null;
            dataset.getNamedModel(graph.getURI())
                    .listStatements(subject != null ? createResource(subject) : null, null, (RDFNode) null)
                    .forEachRemaining(stmt -> {
                        model.add(stmt);
                        if (withObjectProperties && stmt.getObject().isResource()) {
                            getPropertyShapesForResource(stmt.getResource(), voc)
                                    .forEach(shape -> {
                                        if (shape.hasLiteral(FS.importantProperty, true)) {
                                            var property = createProperty(shape.getPropertyResourceValue(SHACLM.path).getURI());
                                            stmt.getResource()
                                                    .listProperties(property)
                                                    .forEachRemaining(model::add);
                                        }
                                    });
                        }
                    });
        });

        return model;
    }
}
