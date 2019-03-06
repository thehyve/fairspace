package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.Vocabulary;
import org.apache.jena.atlas.lib.Pair;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.*;
import org.apache.jena.update.UpdateRequest;
import org.apache.jena.vocabulary.RDF;

import java.util.Collection;
import java.util.List;
import java.util.stream.StreamSupport;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.graph.NodeFactory.createVariable;

class MetadataService {
    private final RDFConnection rdf;
    private final Node graph;
    private Vocabulary vocabulary;

    MetadataService(RDFConnection rdf, Node graph, Vocabulary vocabulary) {
        this.rdf = rdf;
        this.graph = graph;
        this.vocabulary = vocabulary;
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
     * @param withLabels    If set to true, the returned model will also include statements specifying the rdfs:label
 *                          property for the objects of the statements.
     * @return
     */
    Model get(String subject, String predicate, String object, boolean withLabels) {
        var query = withLabels ? "select_by_mask_with_labels" : "select_by_mask";
        return rdf.queryConstruct(storedQuery(query, graph, asURI(subject), asURI(predicate), asURI(object)));
    }

    /**
     * Adds all the statements in the given model to the database
     *
     * If the given model contains any statements for which the predicate is marked as machineOnly,
     * an IllegalArgumentException will be thrown
     *
     * @param model
     */
    void put(Model model) {
        commit("Store metadata", rdf, () -> {
            ensureNoMachineOnlyPredicates(model);
            rdf.load(graph.getURI(), model);
        });
    }


    /**
     * Deletes the statements in the database, based on the combination of subject, predicate and object
     *
     * If any of the fields is null, that field is not included to filter statements to delete. For example, if only
     * subject is given and predicate and object are null, then all statements with the given subject will be deleted.
     *
     * Statements for which the predicate is marked as 'machineOnly' are never deleted. If the predicate is marked as
     * machineOnly, an IllegalArgumentException will be thrown
     *
     * @param subject   Subject URI to filter the delete query on
     * @param predicate Predicate URI to filter the delete query on. Must not be a machineOnly predicate
     * @param object    Object URI to filter the delete query on. Literal values are not supported
     */
    void delete(String subject, String predicate, String object) {
        commit("Delete metadata", rdf, () -> {
            if (predicate != null && vocabulary.isMachineOnlyPredicate(predicate)) {
                throw new IllegalArgumentException("The given predicate is marked as machine-only. It cannot be used directly.");
            }
            rdf.update(storedQuery("delete_not_machineonly_by_mask", graph, asURI(subject), asURI(predicate), asURI(object), vocabulary.getVocabularyGraph()));
        });
    }

    /**
     * Deletes the statemens in the given model from the database.
     *
     * If the model contains any statements for which the predicate is marked as 'machineOnly', an IllegalArgumentException will be thrown.
     * @param model
     */
    void delete(Model model) {
        commit("Delete metadata", rdf, () -> {
            ensureNoMachineOnlyPredicates(model);

            rdf.update(new UpdateDataDelete(new QuadDataAcc(toQuads(model.listStatements().toList()))));
        });
    }

    /**
     * Overwrites metadata in the database with statements from the given model.
     *
     * For any subject/predicate combination in the model to add, the existing data in the database will be removed,
     * before adding the new data. This means that if the given model contains a triple
     *   S rdfs:label "test"
     * then any statement in the database specifying the rdfs:label for S will be deleted. This effectively overwrites
     * values in the database.
     *
     * If the given model contains any statements for which the predicate is marked as machineOnly,
     * an IllegalArgumentException will be thrown
     *
     * @param model
     */
    void patch(Model model) {
        commit("Update metadata", rdf, () -> {
            ensureNoMachineOnlyPredicates(model);

            rdf.update(createPatchQuery(model.listStatements().toList()));
        });
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
        return rdf.queryConstruct(storedQuery("entities_by_type", graph, asURI(type)));
    }

    /**
     * Verifies whether the given model contains any triples with a machine-only predicate
     *
     * Whether a predicate is machine-only, is specified in the vocabulary.
     * @param model
     * @return true iff the given model contains one or more triples with a machine-only predicate
     */
    boolean containsMachineOnlyPredicates(Model model) {
        if(model == null || model.isEmpty())
            return false;

        Model machineOnlyPredicates = vocabulary.getMachineOnlyPredicates();

        // See if any of the predicates is present in the given model
        Iterable<Resource> resourceIterator = machineOnlyPredicates::listSubjects;
        return StreamSupport.stream(resourceIterator.spliterator(), false)
                .anyMatch(resource -> model.listResourcesWithProperty(model.createProperty(resource.getURI())).hasNext());
    }

    /**
     * Ensures that the given model does not contain any machine-only predicates.
     *
     * If the model does contain a machine-only predicate, an IllegalArgumentException is thrown
     * @param model
     */
    private void ensureNoMachineOnlyPredicates(Model model) {
        if (containsMachineOnlyPredicates(model)) {
            throw new IllegalArgumentException("The given model contains one or more statements with machine-only predicates. This is not allowed.");
        }
    }

    private String createPatchQuery(Collection<Statement> statements) {
        var updateRequest = new UpdateRequest();

        statements
                .stream()
                .map(s -> Pair.create(s.getSubject(), s.getPredicate()))
                .distinct()
                .map(p -> new Quad(
                        graph,                  // Graph
                        p.getLeft().asNode(),   // Subject
                        p.getRight().asNode(),  // Predicate
                        createVariable("o")))   // A free variable matching any object
                .map(q -> new UpdateDeleteWhere(new QuadAcc(singletonList(q))))
                .forEach(updateRequest::add);

        updateRequest.add(new UpdateDataInsert(new QuadDataAcc(toQuads(statements))));

        return updateRequest.toString();
    }

    private List<Quad> toQuads(Collection<Statement> statements) {
        return statements
                .stream()
                .map(s -> new Quad(graph, s.asTriple()))
                .collect(toList());
    }

    private static Node asURI(String uri) {
        if (uri == null) {
            return null;
        }
        validateIRI(uri);
        return createURI(uri);
    }

}
