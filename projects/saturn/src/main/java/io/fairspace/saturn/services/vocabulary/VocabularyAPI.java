package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;


class VocabularyAPI {

    private final RDFConnection rdfConnection;
    private final String vocabularyUri;

    VocabularyAPI(RDFConnection rdfConnection, String vocabularyUri) {
        this.rdfConnection = rdfConnection;
        this.vocabularyUri = vocabularyUri;
    }

    Model getVocabulary() {
        return rdfConnection.queryConstruct("CONSTRUCT { ?s ?p ?o } WHERE { GRAPH <" + vocabularyUri + "> { ?s ?p ?o } . }");
    }

    void setVocabulary(Model vocabulary) {
        rdfConnection.put(vocabularyUri, vocabulary);
    }
}
