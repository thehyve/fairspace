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

    public CollectionsApp(CollectionsService service) {
        this.service = service;
    }

    @Override
    public void init() {
        super.init();

        path("/api/collections", () -> {
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
            delete("/", (req, res) -> {
                var iri = req.queryParams("iri");
                service.delete(iri);
                res.status(SC_NO_CONTENT);
                return "";
            });
        });

        exception(CollectionNotFoundException.class, exceptionHandler(SC_NOT_FOUND, null));
        exception(LocationAlreadyExistsException.class, exceptionHandler(SC_CONFLICT, null));
    }
}
