package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.events.MetadataEvent;
import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.Violation;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.vocabulary.Inference.getInferredStatements;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ChangeableMetadataService extends ReadableMetadataService {
    static final Resource NIL = createResource("http://fairspace.io/ontology#nil");

    private final MetadataEntityLifeCycleManager lifeCycleManager;
    private final MetadataRequestValidator validator;
    private final Consumer<MetadataEvent.Type> eventConsumer;

    public ChangeableMetadataService(RDFConnection rdf, Node graph, Node vocabulary, MetadataEntityLifeCycleManager lifeCycleManager, MetadataRequestValidator validator) {
        this(rdf, graph, vocabulary, 0, lifeCycleManager, validator, type -> {});
    }

    public ChangeableMetadataService(RDFConnection rdf, Node graph, Node vocabulary, MetadataEntityLifeCycleManager lifeCycleManager, MetadataRequestValidator validator, Consumer<MetadataEvent.Type> eventConsumer) {
        this(rdf, graph, vocabulary, 0, lifeCycleManager, validator, eventConsumer);
    }

    public ChangeableMetadataService(RDFConnection rdf, Node graph, Node vocabulary, long tripleLimit, MetadataEntityLifeCycleManager lifeCycleManager, MetadataRequestValidator validator, Consumer<MetadataEvent.Type> eventConsumer) {
        super(rdf, graph, vocabulary, tripleLimit);
        this.lifeCycleManager = lifeCycleManager;
        this.validator = validator;
        this.eventConsumer = eventConsumer;
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
        commit("Store metadata", rdf, () -> update(EMPTY_MODEL, model));
        eventConsumer.accept(MetadataEvent.Type.created);
    }

    /**
     * Marks an entity as deleted
     *
     * @param subject   Subject URI to mark as deleted
     */
    boolean softDelete(Resource subject) {
        if(commit("Mark <" + subject + "> as deleted", rdf, () -> lifeCycleManager.softDelete(subject))) {
            eventConsumer.accept(MetadataEvent.Type.softDeleted);
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
        commit("Delete metadata", rdf, () -> update(model, EMPTY_MODEL));
        eventConsumer.accept(MetadataEvent.Type.deleted);
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
        commit("Update metadata", rdf, () -> {
            var toDelete = createDefaultModel();
            model.listStatements().forEachRemaining(stmt -> {
                // Only explicitly delete triples for URI resources. As this model is also used
                // for validation, we do not want to include blank nodes here. Triples for blank
                // nodes will be deleted automatically when it is not referred to anymore
                if (stmt.getSubject().isURIResource()) {
                    toDelete.add(get(stmt.getSubject().getURI(), stmt.getPredicate().getURI(), null, false));
                }
            });

            update(toDelete, model.removeAll(null, null, NIL));
        });
    }

    private void update(Model modelToRemove, Model modelToAdd) {
        var vocabularyModel = rdf.fetch(vocabulary.getURI());

        addInferredStatements(modelToAdd, vocabularyModel);
        addInferredStatements(modelToRemove, vocabularyModel);

        sanitizeAndValidate(modelToRemove, modelToAdd, vocabularyModel);

        persist(modelToRemove, modelToAdd);
    }

    private void sanitizeAndValidate(Model modelToRemove, Model modelToAdd, Model vocabularyModel) {
        var before = affectedModelSubSet(modelToRemove, modelToAdd);
        sanitize(before, modelToRemove, modelToAdd);
        var after = resultingModelSubset(before, modelToRemove, modelToAdd);
        validate(before, after, modelToRemove, modelToAdd, vocabularyModel);
    }

    /**
     * @return a model containing all triples describing the affected resources
     */
    private Model affectedModelSubSet(Model modelToRemove, Model modelToAdd) {
        var affectedResources = modelToRemove.listSubjects()
                .andThen(modelToAdd.listSubjects())
                .toSet();

        var model = createDefaultModel();
        affectedResources.forEach(r -> {
            if(r.isURIResource()) {
                model.add(rdf.queryConstruct(storedQuery("get_resource_closure", graph, r)));
            }
        });
        return model;
    }

    private void sanitize(Model before, Model modelToRemove, Model modelToAdd) {
        var unchanged = modelToRemove.intersection(modelToAdd);
        modelToRemove.remove(unchanged);
        modelToAdd.remove(unchanged);

        // remove existing statements from modelToAdd
        if (!modelToAdd.isEmpty()) {
            modelToAdd.remove(before);
        }

        // remove non-existing statements from modelToRemove
        for (var it = modelToRemove.listStatements(); it.hasNext(); ) {
            if (!before.contains(it.nextStatement())) {
                it.remove();
            }
        }
    }

    private Model resultingModelSubset(Model before, Model modelToRemove, Model modelToAdd) {
        var after = before.difference(modelToRemove).union(modelToAdd);
        var deletedTypeStatements = modelToRemove.listStatements(null, RDF.type, (RDFNode) null).toModel();
        addObjectTypes(after);
        after.remove(deletedTypeStatements);
        return after;
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
        rdf.update(new UpdateDataDelete(new QuadDataAcc(toQuads(modelToRemove))));

        // Store information on the lifecycle of the entities
        lifeCycleManager.updateLifecycleMetadata(modelToAdd);

        // Store the actual update
        rdf.load(graph.getURI(), modelToAdd);
    }

    private void addInferredStatements(Model model, Model vocabularyModel) {
        if (model.isEmpty()) {
            return;
        }

        var modelWithTypes = createDefaultModel().add(model);
        addSubjectTypes(modelWithTypes);
        var inferredToAdd = getInferredStatements(vocabularyModel, modelWithTypes);
        model.add(inferredToAdd);
    }

    private void addSubjectTypes(Model model) {
        model.listSubjects()
                .filterKeep(RDFNode::isURIResource)
                .filterDrop(subj -> subj.hasProperty(RDF.type))
                .forEachRemaining(subj -> model.add(get(subj.getURI(), RDF.type.getURI(), null, false)));
    }

    private void addObjectTypes(Model model) {
        model.listObjects()
                .filterKeep(RDFNode::isURIResource)
                .mapWith(RDFNode::asResource)
                .filterDrop(obj -> obj.hasProperty(RDF.type))
                .toSet()
                .forEach(obj -> model.add(get(obj.getURI(), RDF.type.getURI(), null, false)));
        model.add(get(null, RDFS.subClassOf.getURI(), null, false));
    }

    private List<Quad> toQuads(Model model) {
        return model.listStatements()
                .mapWith(s -> new Quad(graph, s.asTriple()))
                .toList();
    }
}
