package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.ValidationResult;
import lombok.AllArgsConstructor;
import org.apache.jena.atlas.lib.Pair;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.modify.request.QuadAcc;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.sparql.modify.request.UpdateDeleteWhere;
import org.apache.jena.update.UpdateRequest;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;

@AllArgsConstructor
public
class ReadableMetadataService {
    protected final RDFConnection rdf;
    protected final Node graph;

    /**
     * Returns a model with statements from the metadata database, based on the given selection criteria
     *
     * If any of the fields is null, that field is not included to filter statements. For example, if only
     * subject is given and predicate and object are null, then all statements with the given subject will be returned.
     *
     * @param subject       Subject URI for which you want to return statements
     * @param predicate     Predicate URI for which you want to return statements
     * @param object        Object URI for which you want to return statements. Literal values are not allowed
     * @param withLabels    If set to true, the returned model will also include statements specifying the rdfs:label
 *                          property for the objects of the statements.
     * @return
     */
    Model get(String subject, String predicate, String object, boolean withLabels) {
        var query = withLabels ? "select_by_mask_with_labels" : "select_by_mask";
        return rdf.queryConstruct(storedQuery(query, graph, asURI(subject), asURI(predicate), asURI(object)));
    }

    /**
     * Returns a model with all fairspace metadata entities for the given type
     *
     * The method returns the type and the label (if present) for all entities that match
     * the given type if the type is marked as fairspaceEntity in the vocabulary.
     *
     * If the type is not marked as fairspaceEntity, the resulting model will be empty
     *
     * If the type is null, all entities for which the type is marked as fairspaceEntity in
     * the vocabulary will be returned.
     *
     * @param type  URI for the type to filter the list of entities on
     * @return
     */
    Model getByType(String type) {
        System.out.println(storedQuery("entities_by_type", graph, asURI(type)));
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
