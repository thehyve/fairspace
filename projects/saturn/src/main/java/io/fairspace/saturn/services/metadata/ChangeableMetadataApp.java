package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.PayloadParsingException;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;

import static io.fairspace.saturn.services.ModelUtils.JSON_LD_HEADER_STRING;
import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.util.ValidationUtils.validateContentType;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public class ChangeableMetadataApp extends ReadableMetadataApp {
    protected final ChangeableMetadataService api;

    public ChangeableMetadataApp(String basePath, ChangeableMetadataService api) {
        super(basePath, api);
        this.api = api;
    }

    @Override
    public void init() {
        super.init();

        path(basePath, () -> {
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
            exception(ValidationException.class, (e, req, res) -> {
                log.error("400 Error handling request {} {}", req.requestMethod(), req.uri());
                e.getViolations().forEach(v -> log.error("{}", v));

                res.type(APPLICATION_JSON.asString());
                res.status(SC_BAD_REQUEST);
                res.body(errorBody(SC_BAD_REQUEST, "Validation Error", e.getViolations()));
            });
        });
    }

}
