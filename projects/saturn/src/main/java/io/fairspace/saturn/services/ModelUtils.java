package io.fairspace.saturn.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.function.Consumer;

import static javax.servlet.http.HttpServletResponse.*;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.JSONLD;

@Slf4j
public class ModelUtils {
    public static Model readModel(HttpServletRequest req) throws IOException {
        var model = createDefaultModel();
        RDFDataMgr.read(model, req.getInputStream(), JSONLD.getLang());
        return model;
    }

    public static void writeModel(Model model, HttpServletResponse resp) throws IOException {
        resp.setStatus(SC_OK);
        resp.setContentType(JSONLD.getLang().getHeaderString());
        RDFDataMgr.write(resp.getOutputStream(), model, JSONLD);
    }

    public static void processModel(HttpServletRequest req, HttpServletResponse resp, Consumer<Model> action) throws IOException {
        if (!JSONLD.getLang().getHeaderString().equals(req.getContentType())) {
            resp.sendError(SC_BAD_REQUEST, "Invalid content type");
            return;
        }
        Model model;
        try {
            model = readModel(req);
        } catch (Exception e) {
            log.error("Error parsing a model", e);
            resp.sendError(SC_BAD_REQUEST);
            return;
        }
        try {
            action.accept(model);
            resp.setStatus(SC_ACCEPTED);
        } catch (Exception e) {
            log.error("Unexpected error", e);
            resp.setStatus(SC_INTERNAL_SERVER_ERROR);
        }
    }
}
