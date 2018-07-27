package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
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
public class CollectionService {
    private static final String GET_COLLECTIONS =
            String.format(
                    "CONSTRUCT { ?s ?p ?o } WHERE {?s ?p ?o . ?s <%s> <%s> . }",
                    RDF.type.getURI(), Fairspace.Collection);

    @Autowired
    private TripleService tripleService;


    public void createCollection(Collection collection) {
        tripleService.postTriples(toTriples(collection));
    }

    public void patchCollection(Collection collection) {
        tripleService.patchTriples(toTriplesForUpdate(collection));
    }

    public List<Collection> getCollections() {
        Map<String, List<Statement>> triplesBySubject = tripleService
                .executeConstructQuery(GET_COLLECTIONS)
                .listStatements()
                .toList()
                .stream()
                .collect(groupingBy(s -> s.getSubject().getURI()));
        return triplesBySubject
                .values()
                .stream()
                .map(CollectionService::fromTriples)
                .collect(toList());
    }

    private static Model toTriples(Collection collection) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(collection.getUri());
        model.add(subject, RDF.type, Fairspace.Collection);
        model.add(subject, Fairspace.name, model.createLiteral(requireNonNull(collection.getName(), "Collection name is mandatory")));
        model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));

        return model;
    }

    private static Model toTriplesForUpdate(Collection collection) {
        Model model = createDefaultModel();

        Resource subject = model.createResource(collection.getUri());

        if (collection.getName() != null) {
            model.add(subject, Fairspace.name, model.createLiteral(requireNonNull(collection.getName(), "Collection name is mandatory")));
        }

        if (collection.getDescription() != null) {
            model.add(subject, Fairspace.description, model.createLiteral(Optional.ofNullable(collection.getDescription()).orElse("")));
        }
        return model;
    }

    private static Collection fromTriples(List<Statement> triples) {
        Collection collection = new Collection();
        triples.forEach(t -> {
            collection.setUri(t.getSubject().getURI());
            if (t.getPredicate().equals(Fairspace.name)) {
                collection.setName(t.getObject().asLiteral().getString());
            } else if (t.getPredicate().equals(Fairspace.description)) {
                collection.setDescription(t.getObject().asLiteral().toString());
            }
        });
        return collection;
    }
}
