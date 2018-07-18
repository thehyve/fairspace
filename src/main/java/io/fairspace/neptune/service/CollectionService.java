package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.ObjectType;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.model.TripleObject;
import io.fairspace.neptune.vocabulary.Fairspace;
import io.fairspace.neptune.vocabulary.Rdf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;

@Service
public class CollectionService {
    private static final String GET_COLLECTIONS =
            String.format(
                    "CONSTRUCT { ?s ?p ?o } WHERE {?s ?p ?o . ?s <%s> <%s> . }",
                    Rdf.TYPE, Fairspace.COLLECTION);

    @Autowired
    private TripleService tripleService;


    public void createCollection(Collection collection) {

        tripleService.postTriples(toTriples(collection));
    }

    public List<Collection> getCollections() {
        Map<String, List<Triple>> triplesBySubject = tripleService
                .executeConstructQuery(GET_COLLECTIONS)
                .stream()
                .collect(groupingBy(Triple::getSubject));
        return triplesBySubject
                .values()
                .stream()
                .map(CollectionService::fromTriples)
                .collect(toList());
    }

    private static List<Triple> toTriples(Collection collection) {
        String subject = collection.getUri().toString();
        return Arrays.asList(
                new Triple(subject, Rdf.TYPE, new TripleObject(ObjectType.uri, Fairspace.COLLECTION.toString(), null, null)),
                new Triple(subject, Fairspace.NAME, new TripleObject(ObjectType.literal, collection.getName(), null, null)),
                new Triple(subject, Fairspace.DESCRIPTION, new TripleObject(ObjectType.literal, collection.getDescription(), null, null))
        );
    }

    private static Collection fromTriples(List<Triple> triples) {
        Collection collection = new Collection();
        triples.forEach(t -> {
            collection.setUri(URI.create(t.getSubject()));
            if (t.getPredicate().equals(Fairspace.NAME)) {
                collection.setName(t.getObject().getValue());
            } else if (t.getPredicate().equals(Fairspace.DESCRIPTION)) {
                collection.setDescription(t.getObject().getValue());
            }
        });
        return collection;
    }
}
