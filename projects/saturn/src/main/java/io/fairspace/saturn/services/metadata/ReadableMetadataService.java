package io.fairspace.saturn.services.metadata;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;

import static io.fairspace.saturn.rdf.SparqlUtils.*;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.graph.NodeFactory.createURI;

@AllArgsConstructor
public
class ReadableMetadataService {
    protected final Dataset dataset;
    protected final Node graph;
    protected final Node vocabulary;
    protected final long tripleLimit;

    public ReadableMetadataService(Dataset dataset, Node graph, Node vocabulary) {
        this(dataset, graph, vocabulary, 0);
    }

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
        var queryTemplate = withObjectProperties ? "select_by_mask_with_important_properties" : "select_by_mask";

        var query = storedQuery(queryTemplate, graph, asURI(subject), asURI(predicate), asURI(object), vocabulary);

        return runWithLimit(query);
    }

    private Model runWithLimit(String query) {
        if (tripleLimit > 0) {
            Model model = queryConstruct(dataset, limit(query, tripleLimit + 1));

            if (model.size() > tripleLimit) {
                throw new TooManyTriplesException();
            }

            return model;
        } else {
            return queryConstruct(dataset, query);
        }
    }

    protected static Node asURI(String uri) {
        if (uri == null) {
            return null;
        }
        validateIRI(uri);
        return createURI(uri);
    }

}
