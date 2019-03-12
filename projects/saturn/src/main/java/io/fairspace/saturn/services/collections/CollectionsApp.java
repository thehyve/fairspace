package io.fairspace.saturn.services.collections;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.fairspace.saturn.rdf.dao.DAOException;
import io.fairspace.saturn.services.IRIModule;
import lombok.extern.slf4j.Slf4j;
import spark.servlet.SparkApplication;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.*;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public class CollectionsApp implements SparkApplication {
    private final CollectionsService service;
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new IRIModule())
            .registerModule(new JavaTimeModule())
            .configure(WRITE_DATES_AS_TIMESTAMPS, false);

    public CollectionsApp(CollectionsService service) {
        this.service = service;
    }

    @Override
    public void init() {
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

        exception(JsonMappingException.class, exceptionHandler(SC_BAD_REQUEST, "Invalid request body"));
        exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
        exception(DAOException.class, exceptionHandler(SC_BAD_REQUEST, "Bad request"));
        exception(CollectionNotFoundException.class, exceptionHandler(SC_NOT_FOUND, null));
        exception(CollectionAccessDeniedException.class, exceptionHandler(SC_UNAUTHORIZED, null));
        exception(LocationAlreadyExistsException.class, exceptionHandler(SC_CONFLICT, null));
    }
}
