package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;

import java.util.Collection;
import java.util.List;

import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class ChangeableMetadataService extends ReadableMetadataService {
    private final MetadataEntityLifeCycleManager lifeCycleManager;
    private final MetadataRequestValidator validator;

    public ChangeableMetadataService(RDFConnection rdf, Node graph, MetadataEntityLifeCycleManager lifeCycleManager, MetadataRequestValidator validator) {
        super(rdf, graph);
        this.lifeCycleManager = lifeCycleManager;
        this.validator = validator;
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
        commit("Store metadata", rdf, () -> update(null, model));
    }

    /**
     * Deletes the statements in the database, based on the combination of subject, predicate and object
     *
     * If any of the fields is null, that field is not included to filter statements to delete. For example, if only
     * subject is given and predicate and object are null, then all statements with the given subject will be deleted.
     *
     * If the set of triples matching the provided wildcard includes any protected triple (e.g. with a predicate marked
     * as fs:machineOnly) a ValidationException will be thrown.
     *
     * @param subject   Subject URI to filter the delete query on
     * @param predicate Predicate URI to filter the delete query on. Must not be a machineOnly predicate
     * @param object    Object URI to filter the delete query on. Literal values are not supported
     */
    void delete(String subject, String predicate, String object) {
        commit("Delete metadata", rdf, () -> delete(get(subject, predicate, object, false)));
    }

    /**
     * Deletes the statements in the given model from the database.
     *
     * If the model contains any statements for which the predicate is marked as 'machineOnly', an IllegalArgumentException will be thrown.
     * @param model
     */
    void delete(Model model) {
        commit("Delete metadata", rdf, () -> update(model, null));
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
            var toDelete = createDefaultModel();
            model.listStatements().forEachRemaining(stmt ->
                    toDelete.add(get(stmt.getSubject().getURI(), stmt.getPredicate().getURI(), null, false)));

            // Exclude statements already present in the database from validation
            var unchanged = toDelete.intersection(model);
            model.remove(unchanged);
            toDelete.remove(unchanged);

            update(toDelete, model);
        });
    }

    private void update(Model modelToRemove, Model modelToAdd) {
        ensureValidParameters(modelToRemove, modelToAdd);

        if (modelToRemove != null) {
            rdf.update(new UpdateDataDelete(new QuadDataAcc(toQuads(modelToRemove.listStatements().toList()))));
        }

        if (modelToAdd != null) {
            // Store information on the lifecycle of the entities
            lifeCycleManager.updateLifecycleMetadata(modelToAdd);

            // Store the actual update
            rdf.load(graph.getURI(), modelToAdd);
        }
    }

    /**
     * Runs the given validationLogic the validator and throws an IllegalArgumentException if the validation fails
     *
     * If no validator is specified, the method does nothing
     */
    private void ensureValidParameters(Model toRemove, Model toAdd) {
        if(validator != null) {
            var validationResult = validator.validate(toRemove, toAdd);
            if(!validationResult.isValid()) {
                throw new ValidationException(validationResult.getMessage());
            }
        }
    }

    private List<Quad> toQuads(Collection<Statement> statements) {
        return statements
                .stream()
                .map(s -> new Quad(graph, s.asTriple()))
                .collect(toList());
    }
}
