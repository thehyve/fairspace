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
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.modify.request.*;
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
        commit("Store metadata", rdf, () -> {
            ensureValidParameters(validator -> validator.validatePut(model));

            // Store information on the lifecycle of the entities
            lifeCycleManager.updateLifecycleMetadata(model);

            // Store the actual update
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
            ensureValidParameters(validator -> validator.validateDelete(subject, predicate, object));
            rdf.update(storedQuery("delete_not_machineonly_by_mask", graph, asURI(subject), asURI(predicate), asURI(object)));
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
            ensureValidParameters(validator -> validator.validateDelete(model));
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
            ensureValidParameters(validator -> validator.validatePatch(model));

            // Store information on the lifecycle of the entities
            lifeCycleManager.updateLifecycleMetadata(model);

            rdf.update(createPatchQuery(model.listStatements().toList()));
        });
    }

    /**
     * Runs the given validationLogic the validator and throws an IllegalArgumentException if the validation fails
     *
     * If no validator is specified, the method does nothing
     * 
     * @param validationLogic   Logic to be called on the validator. For example: validator -> validator.validatePut(model)
     */
    void ensureValidParameters(Function<MetadataRequestValidator, ValidationResult> validationLogic) {
        if(validator != null) {
            ValidationResult validationResult = validationLogic.apply(validator);
            if(!validationResult.isValid()) {
                throw new ValidationException(validationResult.getMessage());
            }
        }
    }

    private UpdateRequest createPatchQuery(Collection<Statement> statements) {
        var updateRequest = new UpdateRequest();

        statements
                .stream()
                .map(s -> Pair.create(s.getSubject(), s.getPredicate()))
                .distinct()
                .map(p -> new Quad(
                        graph,                  // Graph
                        p.getLeft().asNode(),   // Subject
                        p.getRight().asNode(),  // Predicate
                        Var.alloc("o")))        // A free variable matching any object
                .map(q -> new UpdateDeleteWhere(new QuadAcc(singletonList(q))))
                .forEach(updateRequest::add);

        updateRequest.add(new UpdateDataInsert(new QuadDataAcc(toQuads(statements))));

        return updateRequest;
    }

    private List<Quad> toQuads(Collection<Statement> statements) {
        return statements
                .stream()
                .map(s -> new Quad(graph, s.asTriple()))
                .collect(toList());
    }

}
