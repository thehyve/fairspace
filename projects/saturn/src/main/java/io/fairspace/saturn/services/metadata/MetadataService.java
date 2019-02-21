package io.fairspace.saturn.services.metadata;

import org.apache.jena.atlas.lib.Pair;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.*;
import org.apache.jena.update.UpdateRequest;

import java.util.Collection;
import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.graph.NodeFactory.createVariable;

class MetadataService {
    private final RDFConnection rdf;

    MetadataService(RDFConnection rdf) {
        this.rdf = rdf;
    }

    Model get(String subject, String predicate, String object, boolean withLabels) {
        var query = withLabels ? "select_by_mask_with_labels" : "select_by_mask";
        return rdf.queryConstruct(storedQuery(query, asURI(subject), asURI(predicate), asURI(object)));
    }

    void put(Model model) {
        rdf.load(model);
    }

    void delete(String subject, String predicate, String object) {
        rdf.update(storedQuery("delete_by_mask", asURI(subject), asURI(predicate), asURI(object)));
    }
    void delete(Model model) {
        rdf.update(new UpdateDataDelete(new QuadDataAcc(toQuads(model.listStatements().toList()))));
    }

    void patch(Model model) {
        rdf.update(createPatchQuery(model.listStatements().toList()));
    }


    Model getByType(String type) {
        return rdf.queryConstruct(storedQuery("entities_by_type", asURI(type)));
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
                        createVariable("o"))) // A free variable matching any object
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

    private static Node asURI(String uri) {
        if (uri == null) {
            return null;
        }
        validateIRI(uri);
        return createURI(uri);
    }

}
