package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdfconnection.RDFConnection;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.fairspace.saturn.services.ModelUtils.processModel;
import static io.fairspace.saturn.services.ModelUtils.writeModel;

public class VocabularyAPIServlet extends HttpServlet {
    private final VocabularyAPI api;

    public VocabularyAPIServlet(RDFConnection rdfConnection) {
        this.api = new VocabularyAPI(rdfConnection);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        writeModel(api.getVocabulary(), resp);
    }

    // TODO: Replace with more fine-grained methods
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        processModel(req, resp, api::setVocabulary);
    }
}
