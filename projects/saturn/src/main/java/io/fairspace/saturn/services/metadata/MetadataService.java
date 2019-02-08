package io.fairspace.saturn.services.metadata;

import lombok.Value;
import org.apache.jena.atlas.lib.Pair;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.*;
import org.apache.jena.update.UpdateRequest;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.util.Collections.singletonList;
import static java.util.Comparator.naturalOrder;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;

class MetadataService {
    private final RDFConnection rdf;

    MetadataService(RDFConnection rdf) {
        this.rdf = rdf;
    }

    Model get(String subject, String predicate, String object) {
        var query = prepareQuery("CONSTRUCT { ?s ?p ?o . } WHERE { ?s ?p ?o . }", subject, predicate, object);
        return rdf.queryConstruct(query);
    }

    void put(Model model) {
        rdf.put(model);
    }

    void delete(String subject, String predicate, String object) {
        var query = prepareQuery("DELETE WHERE { ?s ?p ?o . }", subject, predicate, object);
        rdf.update(query);
    }

    void delete(Model model) {
        rdf.update(new UpdateDataDelete(new QuadDataAcc(toQuads(model.listStatements().toList()))));
    }

    void patch(Model model) {
        rdf.update(createPatchQuery(model.listStatements().toList()));
    }

    static String createPatchQuery(Collection<Statement> statements) {
        var updateRequest = new UpdateRequest();

        statements
                .stream()
                .map(s -> Pair.create(s.getSubject(), s.getPredicate()))
                .distinct()
                .map(p -> new Quad(
                        Quad.defaultGraphNodeGenerated,                  // Default graph
                        p.getLeft().asNode(),                            // Subject
                        p.getRight().asNode(),                           // Predicate
                        NodeFactory.createVariable("o"))) // A free variable matching any object
                .map(q -> new UpdateDeleteWhere(new QuadAcc(singletonList(q))))
                .forEach(updateRequest::add);

        updateRequest.add(new UpdateDataInsert(new QuadDataAcc(toQuads(statements))));

        return updateRequest.toString();
    }

    private static List<Quad> toQuads(Collection<Statement> statements) {
        return statements
                .stream()
                .map(s -> new Quad(Quad.defaultGraphNodeGenerated, s.asTriple()))
                .collect(toList());
    }

    private static String prepareQuery(String template, String subject, String predicate, String object) {
        var sparql = new ParameterizedSparqlString(template);
        bindIri(sparql, "s", subject);
        bindIri(sparql, "p", predicate);
        bindIri(sparql, "o", object);
        return sparql.toString();
    }

    private static void bindIri(ParameterizedSparqlString sparql, String variable, String iri) {
        if (iri != null) {
            sparql.setIri(variable, iri);
        }
    }

    public List<EntityDTO> getByType(String type) {
        if (type == null) {
            throw new IllegalArgumentException("No entity type specified");
        }

        var result = new ArrayList<EntityDTO>();
        rdf.querySelect(storedQuery("entities_by_type", createURI(type)),
                row -> result.add(new EntityDTO(
                        row.get("iri").asResource().getURI(),
                        row.get("label").asLiteral().getString(),
                        row.get("comment").asLiteral().getString())));
        result.sort(naturalOrder());
        return result;
    }

    @Value
    static class EntityDTO implements Comparable<EntityDTO> {
        String iri;
        String label;
        String comment;

        @Override
        public int compareTo(EntityDTO o) {
            if (label != null) {
                return o.label != null ? label.compareTo(o.label) : -1;
            }

            return o.label != null ? 1 : 0;
        }
    }
}
