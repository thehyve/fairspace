package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.PayloadParsingException;
import lombok.AllArgsConstructor;

import static io.fairspace.saturn.services.ModelUtils.*;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.util.ValidationUtils.validateContentType;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

@AllArgsConstructor
public class MetadataApp extends BaseApp {
    private final String basePath;
    private final MetadataService api;

    @Override
    public void init() {
        super.init();

        path(basePath, () -> {
            get("/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSON_LD_HEADER_STRING);
                return toJsonLD(api.get(
                        req.queryParams("subject"),
                        req.queryParams("predicate"),
                        req.queryParams("object"),
                        req.queryParams().contains("labels")));
            });
            get("/entities/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(api.getByType(req.queryParams("type")));
            });
            put("/", (req, res) -> {
                validateContentType(req, JSON_LD_HEADER_STRING);
                api.put(fromJsonLD(req.body()));
                return "";
            });
            patch("/", (req, res) -> {
                validateContentType(req, JSON_LD_HEADER_STRING);
                api.patch(fromJsonLD(req.body()));
                return "";
            });
            delete("/", (req, res) -> {
                if (JSON_LD_HEADER_STRING.equals(req.contentType())) {
                    api.delete(fromJsonLD(req.body()));
                } else {
                    api.delete(req.queryParams("subject"), req.queryParams("predicate"), req.queryParams("object"));
                }
                return "";
            });
            exception(PayloadParsingException.class, exceptionHandler(SC_BAD_REQUEST, "Malformed request body"));
        });
    }
}
