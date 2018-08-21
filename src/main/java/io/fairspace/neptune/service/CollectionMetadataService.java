package io.fairspace.neptune.service;

import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.vocabulary.Fairspace;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@Service
public class CollectionMetadataService {
    private static final String COLLECTION_URI_FORMAT = "http://fairspace.com/iri/collections/%d";
    private static final String GET_COLLECTIONS =
            String.format(
                    "CONSTRUCT { ?s ?p ?o } WHERE {?s ?p ?o . ?s <%s> <%s> . }",
                    RDF.type.getURI(), Fairspace.Collection);

    @Autowired
    private TripleService tripleService;

    public Optional<CollectionMetadata> getCollection(String uri) {
        Model model = tripleService.retrieveTriples(uri);
        if(model.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(fromTriples(model.listStatements().toList()));
        }
    }

    public void createCollection(CollectionMetadata collectionMetadata) {
        tripleService.postTriples(toTriples(collectionMetadata));
    }

    public void patchCollection(CollectionMetadata collectionMetadata) {
        tripleService.patchTriples(toTriplesForUpdate(collectionMetadata));
    }

    public List<CollectionMetadata> getCollections() {
        Map<String, List<Statement>> triplesBySubject = tripleService
                .executeConstructQuery(GET_COLLECTIONS)
                .listStatements()
                .toList()
                .stream()
                .collect(groupingBy(s -> s.getSubject().getURI()));
        return triplesBySubject
                .values()
                .stream()
                .map(CollectionMetadataService::fromTriples)
                .collect(toList());
    }

    private static Model toTriples(CollectionMetadata collectionMetadata) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(collectionMetadata.getUri());
        model.add(subject, RDF.type, Fairspace.Collection);
        model.add(subject, Fairspace.name, model.createLiteral(requireNonNull(collectionMetadata.getName(), "CollectionMetadata name is mandatory")));
        model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collectionMetadata.getDescription()).orElse("")));

        return model;
    }

    private static Model toTriplesForUpdate(CollectionMetadata collectionMetadata) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(collectionMetadata.getUri());

        if (collectionMetadata.getName() != null) {
            model.add(subject, Fairspace.name, model.createLiteral(requireNonNull(collectionMetadata.getName(), "CollectionMetadata name is mandatory")));
        }

        if (collectionMetadata.getDescription() != null) {
            model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collectionMetadata.getDescription()).orElse("")));
        }
        return model;
    }

    private static CollectionMetadata fromTriples(List<Statement> triples) {
        CollectionMetadata collectionMetadata = new CollectionMetadata();
        triples.forEach(t -> {
            collectionMetadata.setUri(t.getSubject().getURI());
            if (t.getPredicate().equals(Fairspace.name)) {
                collectionMetadata.setName(t.getObject().asLiteral().getString());
            } else if (t.getPredicate().equals(Fairspace.description)) {
                collectionMetadata.setDescription(t.getObject().asLiteral().toString());
            }
        });
        return collectionMetadata;
    }

    public String getUri(Long id) {
        return String.format(COLLECTION_URI_FORMAT, id);
    }
}
