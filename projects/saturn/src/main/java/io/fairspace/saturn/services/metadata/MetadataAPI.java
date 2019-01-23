package io.fairspace.saturn.services.metadata;

import org.apache.jena.graph.NodeFactory;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.*;
import org.apache.jena.atlas.lib.Pair;

import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;

class MetadataAPI {
    private final RDFConnection rdfConnection;

    MetadataAPI(RDFConnection rdfConnection) {
        this.rdfConnection = rdfConnection;
    }

    Model get(String subject, String predicate, String object) {
        String query = prepareQuery("CONSTRUCT { ?s ?p ?o . } WHERE { ?s ?p ?o . }", subject, predicate, object);
        return rdfConnection.queryConstruct(query);
    }

    void put(Model model) {
        rdfConnection.put(model);
    }

    void delete(String subject, String predicate, String object) {
        String query = prepareQuery("DELETE WHERE { ?s ?p ?o . }", subject, predicate, object);
        rdfConnection.update(query);
    }

    void delete(Model model) {
        rdfConnection.update(new UpdateDataDelete(new QuadDataAcc(toQuads(model.listStatements().toList()))));
    }

    void patch(Model model) {
        rdfConnection.update(createPatchQuery(model.listStatements().toList()));
    }

    static String createPatchQuery(Collection<Statement> statements) {
        int[] counter = {0};
        List<Quad> quadsToDelete = statements
                        .stream()
                        .map(s -> Pair.create(s.getSubject(), s.getPredicate()))
                        .distinct()
                        .map(p -> new Quad(
                                Quad.defaultGraphNodeGenerated,
                                p.getLeft().asNode(),
                                p.getRight().asNode(),
                                NodeFactory.createVariable("o" + ++counter[0])))
                        .collect(toList());

        List<Quad> quadsToAdd = toQuads(statements);

        UpdateDeleteWhere updateDataDelete = new UpdateDeleteWhere(new QuadAcc(quadsToDelete));
        UpdateDataInsert updateDataInsert = new UpdateDataInsert(new QuadDataAcc(quadsToAdd));

        return updateDataDelete + ";\n" + updateDataInsert;
    }

    private static List<Quad> toQuads(Collection<Statement> statements) {
        return statements
                .stream()
                .map(s -> new Quad(Quad.defaultGraphNodeGenerated , s.asTriple()))
                .collect(toList());
    }

    private static String prepareQuery(String template, String subject, String predicate, String object) {
        ParameterizedSparqlString sparql = new ParameterizedSparqlString(template);
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
}
