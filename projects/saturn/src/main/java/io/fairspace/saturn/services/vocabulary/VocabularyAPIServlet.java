package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdfconnection.RDFConnection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.fairspace.saturn.services.ModelUtils.readModel;
import static io.fairspace.saturn.services.ModelUtils.writeModel;
import static javax.servlet.http.HttpServletResponse.SC_CREATED;

public class VocabularyAPIServlet extends HttpServlet {
    private final VocabularyAPI api;

    public VocabularyAPIServlet(RDFConnection rdfConnection, String vocabularyUri) {
        this.api = new VocabularyAPI(rdfConnection, vocabularyUri);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        writeModel(api.getVocabulary(), resp);
    }

    // TODO: Replace with more fine-grained methods
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        api.setVocabulary(readModel(req));
        resp.setStatus(SC_CREATED);
    }
}
