package io.fairspace.saturn.services.metadata;

import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

public class MetadataApp implements SparkApplication {
    private final MetadataService api;

    public MetadataApp(RDFConnection rdfConnection) {
        this.api = new MetadataService(rdfConnection);
    }

    @Override
    public void init() {
        path("/api/meta", () -> {
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
            exception(RiotException.class, (e, req, res) -> {
                res.status(SC_BAD_REQUEST);
                res.body("Malformed request body");
            });
            exception(IllegalArgumentException.class, (e, req, res) -> {
                res.status(SC_BAD_REQUEST);
                res.body(e.getMessage());
            });
        });
    }
}
