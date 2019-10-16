package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.PayloadParsingException;
import io.fairspace.saturn.services.metadata.serialization.RDFSerializer;
import io.fairspace.saturn.services.metadata.serialization.Serializer;
import io.fairspace.saturn.services.metadata.validation.ValidationException;
import io.fairspace.saturn.util.UnsupportedMediaTypeException;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import spark.Request;

import java.util.List;
import java.util.stream.Collectors;

import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.util.ValidationUtils.*;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static javax.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static org.apache.jena.riot.RDFFormat.TURTLE;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public class ChangeableMetadataApp extends ReadableMetadataApp {
    protected final ChangeableMetadataService api;
    private final String baseURI;

    private static final List<Serializer> deserializers = List.of(
            new RDFSerializer(JSONLD),
            new RDFSerializer(TURTLE)
    );

    private static final List<String> supportedMimetypes = deserializers
            .stream()
            .map(Serializer::getMimeType)
            .collect(Collectors.toList());

    public ChangeableMetadataApp(String basePath, ChangeableMetadataService api, String baseURI) {
        super(basePath, api);
        this.api = api;
        this.baseURI = baseURI;
    }

    @Override
    protected void initApp() {
        super.initApp();

        put("/", (req, res) -> {
            Model model = getModelFromRequest(req);

            if(model == null) {
                throw new UnsupportedMediaTypeException(supportedMimetypes);
            }

            api.put(model);

            res.status(SC_NO_CONTENT);
            return "";
        });
        patch("/", (req, res) -> {
            Model model = getModelFromRequest(req);

            if(model == null) {
                throw new UnsupportedMediaTypeException(supportedMimetypes);
            }

            api.patch(model);

            res.status(SC_NO_CONTENT);
            return "";
        });
        delete("/", (req, res) -> {
            Model model = getModelFromRequest(req);
            if(model != null) {
                 api.delete(model);
            } else {
                var subject = req.queryParams("subject");
                validate(subject != null, "Parameter \"subject\" is required");
                validateIRI(subject);
                if (!api.softDelete(createResource(subject))) {
                    // Subject could not be deleted. Return a 404 error response
                    return null;
                }
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

    private Model getModelFromRequest(Request req) {
        for(Serializer deserializer: deserializers) {
            if(hasContentType(req, deserializer.getMimeType())) {
                return deserializer.deserialize(req.body(), baseURI);
            }
        }

        return null;
    }
}
