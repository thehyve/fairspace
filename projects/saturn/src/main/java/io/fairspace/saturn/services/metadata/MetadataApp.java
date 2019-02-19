package io.fairspace.saturn.services.metadata;

import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.returnError;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static javax.servlet.http.HttpServletResponse.SC_NOT_FOUND;
import static org.apache.http.entity.ContentType.APPLICATION_JSON;
import static org.apache.http.entity.ContentType.TEXT_PLAIN;
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
            get("pids", (req, res) -> {
                var iri = api.iriByPath(req.queryParams("path"));
                if (iri == null) {
                    res.type(APPLICATION_JSON.getMimeType());
                    return errorBody(SC_NOT_FOUND, "Path not found");
                } else {
                    res.type(TEXT_PLAIN.getMimeType());
                    return iri;
                }
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
