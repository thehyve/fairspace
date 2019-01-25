package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.rdf.Vocabulary.VOCABULARY_GRAPH;

class VocabularyAPI {

    private final RDFConnection rdfConnection;

    VocabularyAPI(RDFConnection rdfConnection) {
        this.rdfConnection = rdfConnection;
    }

    Model getVocabulary() {
        return rdfConnection.queryConstruct("CONSTRUCT { ?s ?p ?o } WHERE { GRAPH <" + VOCABULARY_GRAPH + "> { ?s ?p ?o } . }");
    }

    void setVocabulary(Model vocabulary) {
        rdfConnection.put(VOCABULARY_GRAPH.getURI(), vocabulary);
    }
}
