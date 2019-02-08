package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.graph.NodeFactory.createURI;


class VocabularyService {

    private final RDFConnection rdf;
    private final String vocabularyUri;

    VocabularyService(RDFConnection rdf, String baseURI) {
        this.rdf = rdf;
        this.vocabularyUri = baseURI + "vocabulary";
    }

    Model getVocabulary() {
        return rdf.queryConstruct(storedQuery("get_graph", createURI(vocabularyUri)));
    }

    void setVocabulary(Model vocabulary) {
        rdf.put(vocabularyUri, vocabulary);
    }
}
