package io.fairspace.saturn.services.metadata;

import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.returnError;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

public class MetadataApp implements SparkApplication {
    private final String basePath;
    private final MetadataService api;

    public MetadataApp(String basePath, RDFConnection rdfConnection, Node graph) {
        this.basePath = basePath;
        this.api = new MetadataService(rdfConnection, graph);
    }

    @Override
    public void init() {
        path(basePath, () -> {
            get("/", (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(api.get(
                        req.queryParams("subject"),
                        req.queryParams("predicate"),
                        req.queryParams("object"),
                        req.queryParams().contains("labels")));
            });
            get("/entities/", (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(api.getByType(req.queryParams("type")));
            });
            put("/", (req, res) -> {
                api.put(fromJsonLD(req.body()));
                return "";
            });
            patch("/", (req, res) -> {
                api.patch(fromJsonLD(req.body()));
                return "";
            });
            delete("/", (req, res) -> {
                if (JSONLD.getLang().getHeaderString().equals(req.contentType())) {
                    api.delete(fromJsonLD(req.body()));
                } else {
                    api.delete(req.queryParams("subject"), req.queryParams("predicate"), req.queryParams("object"));
                }
                api.put(fromJsonLD(req.body()));
                return "";
            });
            exception(RiotException.class, (e, req, res) -> returnError(res, SC_BAD_REQUEST, "Malformed request body"));
            exception(IllegalArgumentException.class, (e, req, res) -> returnError(res, SC_BAD_REQUEST, e.getMessage()));
        });
    }
}
