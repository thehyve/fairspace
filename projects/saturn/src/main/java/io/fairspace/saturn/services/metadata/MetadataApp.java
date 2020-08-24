package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.PayloadParsingException;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import spark.Request;

import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.services.metadata.Serialization.deserialize;
import static io.fairspace.saturn.services.metadata.Serialization.serialize;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static javax.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public class MetadataApp extends BaseApp {
    protected final MetadataService api;

    public MetadataApp(String basePath, MetadataService api) {
        super(basePath);
        this.api = api;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            var model = getMetadata(req);
            res.type(req.headers("Accept"));
            return serialize(model, req.headers("Accept"));
        });

        put("/", (req, res) -> {
            var model = deserialize(req.body(), req.contentType());

            api.put(model);

            res.status(SC_NO_CONTENT);
            return "";
        });
        patch("/", (req, res) -> {
            var model = deserialize(req.body(), req.contentType());

            api.patch(model);

            res.status(SC_NO_CONTENT);
            return "";
        });
        delete("/", (req, res) -> {
            if (req.queryParams("subject") != null) {
                var subject = req.queryParams("subject");
                validate(subject != null, "Parameter \"subject\" is required");
                validateIRI(subject);
                if (!api.softDelete(createResource(subject))) {
                    // Subject could not be deleted. Return a 404 error response
                    return null;
                }
            } else {
                var model = deserialize(req.body(), req.contentType());
                api.delete(model);
            }

            res.status(SC_NO_CONTENT);
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
    }

    private Model getMetadata(Request req) {
        return api.get(
                req.queryParams("subject"),
                req.queryParams().contains("includeObjectProperties"));
    }
}
