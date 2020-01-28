package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.Violation;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

import java.util.LinkedHashSet;
import java.util.Objects;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.rdf.ModelUtils.*;
import static io.fairspace.saturn.vocabulary.Inference.applyInference;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ChangeableMetadataService extends ReadableMetadataService {
    static final Resource NIL = createResource("http://fairspace.io/ontology#nil");

    private final DatasetJobSupport dataset;
    private final MetadataEntityLifeCycleManager lifeCycleManager;
    private final MetadataRequestValidator validator;

    public ChangeableMetadataService(DatasetJobSupport dataset, Node graph, Node vocabulary, long tripleLimit, MetadataEntityLifeCycleManager lifeCycleManager, MetadataRequestValidator validator) {
        super(dataset, graph, vocabulary, tripleLimit);
        this.dataset = dataset;
        this.lifeCycleManager = lifeCycleManager;
        this.validator = validator;
    }

    /**
     * Adds all the statements in the given model to the database
     * <p>
     * If the given model contains any statements for which the predicate is marked as machineOnly,
     * an IllegalArgumentException will be thrown
     *
     * @param model
     */
    void put(Model model) {
        dataset.executeWrite(() -> update(EMPTY_MODEL, model));
        audit("METADATA_ADDED");
    }

    /**
     * Marks an entity as deleted
     *
     * @param subject   Subject URI to mark as deleted
     */
    boolean softDelete(Resource subject) {
        if(dataset.calculateWrite(() -> lifeCycleManager.softDelete(subject))) {
            audit("METADATA_MARKED_AS_DELETED", "iri", subject.getURI());
            return true;
        } else {
            return false;
        }
    }

    /**
     * Deletes the statements in the given model from the database.
     * <p>
     * If the model contains any statements for which the predicate is marked as 'machineOnly', an IllegalArgumentException will be thrown.
     *
     * @param model
     */
    void delete(Model model) {
        dataset.executeWrite(() -> update(model, EMPTY_MODEL));
        audit("METADATA_DELETED");
    }

    /**
     * Overwrites metadata in the database with statements from the given model.
     * <p>
     * For any subject/predicate combination in the model to add, the existing data in the database will be removed,
     * before adding the new data. This means that if the given model contains a triple
     * S rdfs:label "test"
     * then any statement in the database specifying the rdfs:label for S will be deleted. This effectively overwrites
     * values in the database.
     * <p>
     * If the given model contains any statements for which the predicate is marked as machineOnly,
     * an IllegalArgumentException will be thrown
     *
     * @param model
     */
    void patch(Model model) {
        dataset.executeWrite(() -> {
            var before = dataset.getNamedModel(graph.getURI());
            var existing = createDefaultModel();
            model.listStatements()
                    .filterKeep(stmt -> stmt.getSubject().isURIResource())
                    .mapWith(stmt -> Pair.of(stmt.getSubject(), stmt.getPredicate()))
                    .toSet()
                    .forEach(pair -> existing.add(before.listStatements(pair.getKey(), pair.getValue(), (RDFNode) null)));

            update(existing.difference(model), model.remove(existing).removeAll(null, null, NIL));
        });
        audit("METADATA_UPDATED");;
    }

    private void update(Model modelToRemove, Model modelToAdd) {
        var before = dataset.getNamedModel(graph.getURI());
        var vocabularyModel = dataset.getNamedModel(vocabulary.getURI());

        applyInference(vocabularyModel, before, modelToRemove);
        applyInference(vocabularyModel, unionView(before, modelToAdd), modelToAdd);

        var after = updatedView(before, modelToRemove, modelToAdd);

        validate(before, after, modelToRemove, modelToAdd, vocabularyModel);

        persist(modelToRemove, modelToAdd);
    }

    private void validate(Model before, Model after, Model modelToRemove, Model modelToAdd, Model vocabularyModel) {
        var violations = new LinkedHashSet<Violation>();
        validator.validate(before, after, modelToRemove, modelToAdd,
                vocabularyModel, (message, subject, predicate, object) ->
                        violations.add(new Violation(message, subject.toString(), Objects.toString(predicate, null), Objects.toString(object, null))));

        if (!violations.isEmpty()) {
            throw new ValidationException(violations);
        }
    }

    private void persist(Model modelToRemove, Model modelToAdd) {
        // Store information on the lifecycle of the entities
        lifeCycleManager.updateLifecycleMetadata(modelToAdd);

        dataset.getNamedModel(graph.getURI()).remove(modelToRemove).add(modelToAdd);
    }
}
