package io.fairspace.saturn.services.metadata;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.graph.NodeFactory.createURI;

@AllArgsConstructor
public
class ReadableMetadataService {
    protected final RDFConnection rdf;
    protected final Node graph;
    protected final Node vocabulary;

    /**
     * Returns a model with statements from the metadata database, based on the given selection criteria
     *
     * If any of the fields is null, that field is not included to filter statements. For example, if only
     * subject is given and predicate and object are null, then all statements with the given subject will be returned.
     *
     * @param subject       Subject URI for which you want to return statements
     * @param predicate     Predicate URI for which you want to return statements
     * @param object        Object URI for which you want to return statements. Literal values are not allowed
     * @param withObjectProperties    If set to true, the returned model will also include statements specifying values for
     *                                certain properties marked as fs:importantProperty in the vocabulary
     * @return
     */
    Model get(String subject, String predicate, String object, boolean withObjectProperties) {
        var query = withObjectProperties ? "select_by_mask_with_important_properties" : "select_by_mask";
        return rdf.queryConstruct(storedQuery(query, graph, asURI(subject), asURI(predicate), asURI(object), vocabulary));
    }

    /**
     * Returns a model with all fairspace metadata entities for the given type
     *
     * The method returns the type and the label (if present) for all entities that match
     * the given type if the type is marked as fs:showInCatalog in the vocabulary.
     *
     * If the type is not marked as fs:showInCatalog, the resulting model will be empty
     *
     * If the type is null, all entities for which the type is marked as fs:showInCatalog in
     * the vocabulary will be returned.
     *
     * @param type  URI for the type to filter the list of entities on
     * @param filterOnCatalog If set to true, only entities marked as `fs:showInCatalog` will be returned
     * @return
     */
    Model getByType(String type, boolean filterOnCatalog) {
        String queryName = filterOnCatalog ? "catalog_entities_by_type" : "entities_by_type";

        return rdf.queryConstruct(storedQuery(
                queryName,
                graph,
                vocabulary,
                asURI(type)
        ));
    }

    protected static Node asURI(String uri) {
        if (uri == null) {
            return null;
        }
        validateIRI(uri);
        return createURI(uri);
    }

}
