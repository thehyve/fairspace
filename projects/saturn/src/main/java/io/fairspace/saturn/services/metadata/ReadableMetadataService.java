package io.fairspace.saturn.services.metadata;

import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.graph.NodeFactory.createURI;

@AllArgsConstructor
public class ReadableMetadataService implements MetadataSource {
    protected final RDFConnection rdf;
    protected final Node graph;

    @Override
    public Model get(String subject, String predicate, String object, boolean withLabels) {
        var query = withLabels ? "select_by_mask_with_labels" : "select_by_mask";
        return rdf.queryConstruct(storedQuery(query, graph, asURI(subject), asURI(predicate), asURI(object)));
    }

    @Override
    public Model getByType(String type) {
        return rdf.queryConstruct(storedQuery("entities_by_type", graph, asURI(type)));
    }

    protected static Node asURI(String uri) {
        if (uri == null) {
            return null;
        }
        validateIRI(uri);
        return createURI(uri);
    }
}
