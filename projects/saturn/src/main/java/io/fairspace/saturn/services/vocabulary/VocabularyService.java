package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.graph.NodeFactory.createURI;


class VocabularyService {

    private final RDFConnection rdf;

    VocabularyService(RDFConnection rdf) {
        this.rdf = rdf;
    }

    Model getVocabulary() {
        return rdf.queryConstruct(storedQuery("get_graph", createURI(getWorkspaceURI() + "vocabulary")));
    }

    void setVocabulary(Model vocabulary) {
        rdf.put(getWorkspaceURI() + "vocabulary", vocabulary);
    }
}
