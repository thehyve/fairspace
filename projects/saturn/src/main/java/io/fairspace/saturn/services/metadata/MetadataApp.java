package io.fairspace.saturn.services.metadata;

import lombok.extern.log4j.Log4j2;
import org.apache.jena.rdf.model.Model;
import spark.Request;

import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.PayloadParsingException;
import io.fairspace.saturn.services.metadata.validation.ValidationException;

import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.services.metadata.Serialization.deserialize;
import static io.fairspace.saturn.services.metadata.Serialization.getFormat;
import static io.fairspace.saturn.services.metadata.Serialization.serialize;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;

import static jakarta.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN;
import static jakarta.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static java.lang.Boolean.FALSE;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.patch;
import static spark.Spark.put;

@Log4j2
public class MetadataApp extends BaseApp {

    private static final String DO_VIEWS_UPDATE = "doViewsUpdate";

    protected final MetadataService api;

    public MetadataApp(String basePath, MetadataService api) {
        super(basePath);
        this.api = api;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            var model = getMetadata(req);
            var format = getFormat(req.headers("Accept"));
            res.type(format.getLang().getHeaderString());
            return serialize(model, format);
        });

        put("/", (req, res) -> {
            var model = deserialize(req.body(), req.contentType());
            var doMaterializedViewsRefresh = req.queryParamOrDefault(DO_VIEWS_UPDATE, FALSE.toString());

            api.put(model, Boolean.valueOf(doMaterializedViewsRefresh));

            res.status(SC_NO_CONTENT);
            return "";
        });
        patch("/", (req, res) -> {
            var model = deserialize(req.body(), req.contentType());
            var doViewsUpdate = req.queryParamOrDefault(DO_VIEWS_UPDATE, FALSE.toString());
            api.patch(model, Boolean.valueOf(doViewsUpdate));

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
                var doMaterializedViewsRefresh = req.queryParamOrDefault(DO_VIEWS_UPDATE, FALSE.toString());
                api.delete(model, Boolean.valueOf(doMaterializedViewsRefresh));
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
        exception(AccessDeniedException.class, (e, req, res) -> {
            log.error("401 Access denied {} {} {}", e.getMessage(), req.requestMethod(), req.uri());

            res.type(APPLICATION_JSON.asString());
            res.status(SC_FORBIDDEN);
            res.body(errorBody(SC_FORBIDDEN, "Access denied", e.getMessage()));
        });
    }

    private Model getMetadata(Request req) {
        return api.get(req.queryParams("subject"), req.queryParams().contains("withValueProperties"));
    }
}
