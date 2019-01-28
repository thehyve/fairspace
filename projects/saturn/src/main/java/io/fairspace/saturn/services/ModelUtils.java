package io.fairspace.saturn.services;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

import static javax.servlet.http.HttpServletResponse.SC_OK;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.JSONLD;

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
}
