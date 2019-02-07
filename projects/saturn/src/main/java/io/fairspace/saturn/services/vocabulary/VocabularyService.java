package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;


class VocabularyService {

    private final RDFConnection rdfConnection;
    private final String vocabularyUri;

    VocabularyService(RDFConnection rdfConnection, String baseURI) {
        this.rdfConnection = rdfConnection;
        this.vocabularyUri = baseURI + "vocabulary";
    }

    Model getVocabulary() {
        return rdfConnection.queryConstruct("CONSTRUCT { ?s ?p ?o } WHERE { GRAPH <" + vocabularyUri + "> { ?s ?p ?o } . }");
    }

    void setVocabulary(Model vocabulary) {
        rdfConnection.put(vocabularyUri, vocabulary);
    }
}
