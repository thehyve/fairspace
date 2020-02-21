package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;

import java.time.Instant;
import java.util.Set;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
import static io.fairspace.saturn.vocabulary.FS.createdBy;
import static io.fairspace.saturn.vocabulary.FS.dateCreated;
import static java.util.stream.Collectors.toSet;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

@AllArgsConstructor
public
class MetadataEntityLifeCycleManager {
    private final Dataset dataset;
    private final Node graph;
    private final Node vocabulary;
    private final UserService userService;
    private final PermissionsService permissionsService;

    /**
     * Instantiates a lifecycle manager without a reference for the permissions
     * @param dataset
     * @param graph
     * @param userService
     */
    public MetadataEntityLifeCycleManager(Dataset dataset, Node graph, Node vocabulary, UserService userService) {
        this(dataset, graph, vocabulary, userService, null);
    }

    /**
     * Stores statements regarding the lifecycle of the entities in this model
     * <p>
     * The lifecycle statements consist of:
     * - a triple for the creator of an entity (see {@value io.fairspace.saturn.vocabulary.FS#CREATED_BY_URI})
     * - a triple for the date this entity was created (see {@value io.fairspace.saturn.vocabulary.FS#DATE_CREATED_URI})
     * <p>
     * In addition, the current user will get manage permissions on this entity as well, through the {@link PermissionsService}
     * <p>
     * Please note that this method will check the database for existence of the entities. For that reason, this method must be called
     * before actually inserting new triples.
     *
     * @param model
     */
    void updateLifecycleMetadata(Model model) {
        if (model == null || model.isEmpty()) {
            return;
        }

        // Determine whether the model to add contains new entities
        // for which new information should be stored
        var newEntities = determineNewEntities(model);

        // If there are new entities, updateLifecycleMetadata creation information for them
        // as well as permissions
        if (!newEntities.isEmpty()) {
            dataset.getNamedModel(graph.getURI()).add(generateCreationInformation(newEntities));
            permissionsService.createResources(newEntities);
        }
    }

    boolean softDelete(Resource resource) {
        permissionsService.ensureAccess(Set.of(resource.asNode()), Access.Write);
        var model = dataset.getNamedModel(graph.getURI());
        resource = resource.inModel(model);
        if (isMachineOnly(resource)) {
            throw new IllegalArgumentException("Cannot mark as deleted machine-only entity " + resource);
        }
        if (model.containsResource(resource) && !resource.hasProperty(FS.dateDeleted)) {
            resource.addLiteral(FS.dateDeleted, toXSDDateTimeLiteral(Instant.now()));
            resource.addProperty(FS.deletedBy, createResource(getThreadContext().getUser().getIri().getURI()));
            return true;
        }
        return false;
    }

    private boolean isMachineOnly(Resource resource) {
        var voc = dataset.getNamedModel(vocabulary.getURI());
        return resource.listProperties(RDF.type)
                .mapWith(Statement::getObject)
                .filterKeep(cl -> voc.listSubjectsWithProperty(SHACLM.targetClass, cl)
                        .filterKeep(shape -> shape.hasLiteral(FS.machineOnly, true))
                        .hasNext())
                .hasNext();
    }

    /**
     * Generates a model with creation information for the list of entities given
     *
     * @param entities
     * @return
     */
    private Model generateCreationInformation(Set<Resource> entities) {
        var model = createDefaultModel();
        var user = model.asRDFNode(getThreadContext().getUser().getIri());
        var now = toXSDDateTimeLiteral(Instant.now());

        entities.forEach(resource -> model.add(resource, createdBy, user).add(resource, dateCreated, now));

        return model;
    }

    /**
     * Returns a list of all entities in the model that are not known in the graph yet
     *
     * @return
     */
    private Set<Resource> determineNewEntities(Model model) {
        var allUris = model.listSubjects().filterKeep(RDFNode::isURIResource).toSet();

        // Filter the list of Uris that we already know
        // in the current graph
        return allUris.stream()
                .filter(uri -> !exists(uri))
                .collect(toSet());
    }

    /**
     * Verifies whether a certain entity exists in the database
     * <p>
     * An entity exists if there is any triples with the given URI as subject
     *
     * @param resource
     * @return
     */
    private boolean exists(Resource resource) {
        return dataset.getNamedModel(graph.getURI()).contains(resource, null);
    }
}
