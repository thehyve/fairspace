package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.services.BaseApp;
import lombok.extern.slf4j.Slf4j;

import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.*;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public class CollectionsApp extends BaseApp {
    private final CollectionsService service;

    public CollectionsApp(String basePath, CollectionsService service) {
        super(basePath);
        this.service = service;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            var iri = req.queryParams("iri");

            if (iri != null) {
                var collection = service.get(iri);
                if (collection != null) {
                    res.type(APPLICATION_JSON.asString());
                    return mapper.writeValueAsString(collection);
                } else {
                    return null; // 404
                }
            } else {
                var collections = service.list();
                res.type(APPLICATION_JSON.asString());
                return mapper.writeValueAsString(collections);
            }
        });
        put("/", (req, res) -> {
            var template = mapper.readValue(req.body(), Collection.class);
            var result = service.create(template);
            if (result == null) {
                res.status(SC_CONFLICT);
                return "";
            } else {
                res.status(SC_CREATED);
                res.type(APPLICATION_JSON.asString());
                return mapper.writeValueAsString(result);
            }
        });
        patch("/", (req, res) -> {
            var collection = mapper.readValue(req.body(), Collection.class);
            var result = service.update(collection);

            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });

        exception(CollectionNotFoundException.class, exceptionHandler(SC_NOT_FOUND, null));
        exception(LocationAlreadyExistsException.class, exceptionHandler(SC_CONFLICT, null));
    }
}
