package io.fairspace.saturn.services.metadata;

import lombok.AllArgsConstructor;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

@AllArgsConstructor
public class MetadataApp implements SparkApplication {
    private final String basePath;
    private final MetadataService api;

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
                return "";
            });
            exception(RiotException.class, exceptionHandler(SC_BAD_REQUEST, "Malformed request body"));
            exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
        });
    }
}
