package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.services.metadata.validation.Violation;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.rdf.ModelUtils.*;
import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
import static io.fairspace.saturn.vocabulary.ShapeUtils.getPropertyShapesForResource;
import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class MetadataService {
    static final Resource NIL = createResource("http://fairspace.io/ontology#nil");

    private final Transactions transactions;
    private final Model vocabulary;
    private final MetadataRequestValidator validator;

    public MetadataService(Transactions transactions, Model vocabulary, MetadataRequestValidator validator) {
        this.transactions = transactions;
        this.vocabulary = vocabulary;
        this.validator = validator;
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
    public Model get(String subject, boolean withObjectProperties) {
        var model = createDefaultModel();

        transactions.executeRead(m -> m
                .listStatements(subject != null ? createResource(subject) : null, null, (RDFNode) null)
                .forEachRemaining(stmt -> {
                    model.add(stmt);
                    if (withObjectProperties && stmt.getObject().isResource()) {
                        getPropertyShapesForResource(stmt.getResource(), vocabulary)
                                .forEach(shape -> {
                                    if (shape.hasLiteral(FS.importantProperty, true)) {
                                        var property = createProperty(shape.getPropertyResourceValue(SHACLM.path).getURI());
                                        stmt.getResource()
                                                .listProperties(property)
                                                .forEachRemaining(model::add);
                                    }
                                });
                    }
                }));

        return model;
    }

    /**
     * Adds all the statements in the given model to the database
     * <p>
     * If the given model contains any statements for which the predicate is marked as machineOnly,
     * an IllegalArgumentException will be thrown
     *
     * @param model
     */
    public void put(Model model) {
        logUpdates(update(EMPTY_MODEL, model));
    }

    /**
     * Marks an entity as deleted
     *
     * @param subject Subject URI to mark as deleted
     */
    public boolean softDelete(Resource subject) {
        var success = transactions.calculateWrite(model -> {
            var resource = subject.inModel(model);

            var machineOnly = resource.listProperties(RDF.type)
                    .mapWith(Statement::getObject)
                    .filterKeep(SYSTEM_VOCABULARY::containsResource)
                    .hasNext();

            if (machineOnly) {
                throw new IllegalArgumentException("Cannot mark as deleted machine-only entity " + resource);
            }
            if (resource.getModel().containsResource(resource) && !resource.hasProperty(FS.dateDeleted)) {
                resource.addLiteral(FS.dateDeleted, toXSDDateTimeLiteral(Instant.now()));
                resource.addProperty(FS.deletedBy, model.wrapAsResource(getUserURI()));
                return true;
            }
            return false;
        });

        if (success) {
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
    public void delete(Model model) {
        logUpdates(update(model, EMPTY_MODEL));
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
    public void patch(Model model) {
        logUpdates(transactions.calculateWrite(before -> {
            var existing = createDefaultModel();
            model.listStatements()
                    .filterKeep(stmt -> stmt.getSubject().isURIResource())
                    .mapWith(stmt -> Pair.of(stmt.getSubject(), stmt.getPredicate()))
                    .toSet()
                    .forEach(pair -> existing.add(before.listStatements(pair.getKey(), pair.getValue(), (RDFNode) null)));

            return update(existing.difference(model), model.remove(existing).removeAll(null, null, NIL));
        }));
    }

    private Set<Resource> update(Model modelToRemove, Model modelToAdd) {
        return transactions.calculateWrite(before -> {
            trimPropertyValues(modelToAdd, RDFS.label);
            var after = updatedView(before, modelToRemove, modelToAdd);

            validate(before, after, modelToRemove, modelToAdd, vocabulary);

            persist(modelToRemove, modelToAdd);

            return modelToRemove.listSubjects().andThen(modelToAdd.listSubjects()).toSet();
        });
    }

    private void logUpdates(Set<Resource> updatedResources) {
        updatedResources.forEach(resource -> audit("METADATA_UPDATED", "iri", resource.getURI()));
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
        transactions.executeWrite(model -> {
            var created = modelToAdd.listSubjects()
                    .filterKeep(RDFNode::isURIResource)
                    .filterDrop(s -> model.listStatements(s, null, (RDFNode) null).hasNext())
                    .toSet();

            model.remove(modelToRemove).add(modelToAdd);

            var user = model.wrapAsResource(getUserURI());
            var now = toXSDDateTimeLiteral(Instant.now());

            created.forEach(s -> model.add(s, FS.createdBy, user).add(s, FS.dateCreated, now));

            modelToAdd.listSubjects().andThen(modelToRemove.listSubjects())
                    .filterKeep(RDFNode::isURIResource)
                    .filterKeep(s -> model.listStatements(s, null, (RDFNode) null).hasNext())
                    .forEachRemaining(s -> model
                            .removeAll(s, FS.modifiedBy, null)
                            .removeAll(s, FS.dateModified, null)
                            .add(s, FS.modifiedBy, user)
                            .add(s, FS.dateModified, now));
        });
    }
}
