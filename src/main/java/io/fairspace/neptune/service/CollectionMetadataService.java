package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.vocabulary.Fairspace;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static java.util.Objects.requireNonNull;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@Service
public class CollectionMetadataService {
    private static final String COLLECTION_URI_FORMAT = "%s/iri/collections/%d";
    private static final String GET_COLLECTIONS =
            String.format(
                    "CONSTRUCT { ?s ?p ?o } WHERE {?s ?p ?o . ?s a <%s> . }",
                    Fairspace.Collection);

    private String metadataBaseUrl;
    private TripleService tripleService;

    @Autowired
    public CollectionMetadataService(
            TripleService tripleService,
            @Value("${app.metadata.base-url}") String metadataBaseUrl) {
        this.tripleService = tripleService;
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

        Resource subject = model.createResource(getUri(collection.getId()));
        model.add(subject, RDF.type, Fairspace.Collection);
        model.add(subject, Fairspace.name, model.createLiteral(collection.getName()));
        model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));

        return model;
    }

    private Model toTriplesForUpdate(Collection collection) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(getUri(collection.getId()));

        if (collection.getName() != null) {
            model.add(subject, Fairspace.name, model.createLiteral(requireNonNull(collection.getName(), "CollectionMetadata name is mandatory")));
        }

        if (collection.getDescription() != null) {
            model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));
        }
        return model;
    }

    public String getUri(Long id) {
        return String.format(COLLECTION_URI_FORMAT, this.metadataBaseUrl, id);
    }
}
