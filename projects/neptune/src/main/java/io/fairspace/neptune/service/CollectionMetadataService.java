package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.UnauthorizedException;
import io.fairspace.neptune.vocabulary.Fairspace;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.Optional;

import static java.util.Objects.requireNonNull;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@Service
public class CollectionMetadataService {
    private static final String COLLECTION_URI_FORMAT = "%s/iri/collections/%d";
    private static final String USER_URI_FORMAT = "%s/iri/users/%s";

    private String metadataBaseUrl;
    private TripleService tripleService;
    private final AuthorizationContainer authorizationContainer;

    @Autowired
    public CollectionMetadataService(
            TripleService tripleService,
            AuthorizationContainer authorizationContainer,
            @Value("${app.metadata.base-url}") String metadataBaseUrl) {
        this.tripleService = tripleService;
        this.authorizationContainer = authorizationContainer;
        this.metadataBaseUrl = metadataBaseUrl;
    }

    public void createCollection(Collection collection) {
        tripleService.postTriples(toTriples(collection));
    }

    public void patchCollection(Collection collection) {
        tripleService.patchTriples(toTriplesForUpdate(collection));
    }

    private Model toTriples(Collection collection) {
        Model model = createDefaultModel();

        ZonedDateTime dateCreated = collection.getDateCreated();

        Resource subject = model.createResource(getCollectionUri(collection.getId()));
        model.add(subject, RDF.type, Fairspace.Collection);
        model.add(subject, RDFS.label, model.createLiteral(collection.getName()));
        model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));
        if (collection.getCreator() != null) {
            Resource creatorResource = model.createResource(getUserUri(collection.getCreator()));
            model.add(subject, Fairspace.creator, creatorResource);
            model.add(creatorResource, RDFS.label, model.createLiteral(getUserFullName()));
        }

        if ( dateCreated != null ) {
            model.add(subject, Fairspace.dateCreated, model.createTypedLiteral(GregorianCalendar.from(dateCreated)));
        }
        return model;
    }

    private Model toTriplesForUpdate(Collection collection) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(getCollectionUri(collection.getId()));

        if (collection.getName() != null) {
            model.add(subject, RDFS.label, model.createLiteral(requireNonNull(collection.getName(), "CollectionMetadata name is mandatory")));
        }

        if (collection.getDescription() != null) {
            model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));
        }
        return model;
    }

    /**
     * Returns the Collection URI as used for metadata
     * @param collectionId
     * @return
     */
    public String getCollectionUri(Long collectionId) {
        return String.format(COLLECTION_URI_FORMAT, this.metadataBaseUrl, collectionId);
    }

    /**
     * Returns the Collection URI as used for metadata, based on the collection's location
     * @param location
     * @return
     */
    public String getCollectionUriByLocation(String location) {
        return getCollectionUri(Locations.extractId(location));

    }

    /**
     * Returns the User URI as used for metadata
     * @param username
     * @return
     */
    public String getUserUri(String username) {
        return String.format(USER_URI_FORMAT, this.metadataBaseUrl, username);
    }

    /**
     * Ask for the fullname of the user that is currently logged in
     * @return
     */
    public String getUserFullName() {
        try {
            return Objects.requireNonNull(authorizationContainer.getFullname());
        } catch (Exception e) {
            throw new UnauthorizedException("No valid authorization", e);
        }
    }

}
