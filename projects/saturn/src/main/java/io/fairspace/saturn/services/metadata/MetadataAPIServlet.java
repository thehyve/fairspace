package io.fairspace.saturn.services.metadata;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.fairspace.saturn.services.ModelUtils.readModel;
import static io.fairspace.saturn.services.ModelUtils.writeModel;
import static javax.servlet.http.HttpServletResponse.SC_ACCEPTED;
import static javax.servlet.http.HttpServletResponse.SC_CREATED;
import static org.apache.jena.riot.RDFFormat.JSONLD;


public class MetadataAPIServlet extends HttpServlet {
    private static final String METHOD_PATCH = "PATCH";

    private final MetadataAPI api;

    public MetadataAPIServlet(RDFConnection rdfConnection) {
        this.api = new MetadataAPI(rdfConnection);
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        switch (req.getMethod()) {
            case METHOD_PATCH:
                doPatch(req, resp);
                break;
            default:
                super.service(req, resp);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Model result = api.get(req.getParameter("subject"), req.getParameter("predicate"), req.getParameter("object"));
        writeModel(result, resp);
    }


    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        api.put(readModel(req));
        resp.setStatus(SC_CREATED);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if (req.getContentType().equals(JSONLD.getLang().getHeaderString())) {
            api.delete(readModel(req));
        } else {
            api.delete(req.getParameter("subject"), req.getParameter("predicate"), req.getParameter("object"));
        }
        resp.setStatus(SC_ACCEPTED);
    }

    private void doPatch(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        api.patch(readModel(req));
        resp.setStatus(SC_ACCEPTED);
    }
}
