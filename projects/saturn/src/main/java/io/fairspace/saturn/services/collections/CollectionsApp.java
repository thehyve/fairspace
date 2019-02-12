package io.fairspace.saturn.services.collections;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.auth.SecurityUtil;
import org.apache.jena.rdfconnection.RDFConnection;
import spark.servlet.SparkApplication;

import static javax.servlet.http.HttpServletResponse.*;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

public class CollectionsApp implements SparkApplication {
    private final CollectionsService service;
    private final ObjectMapper mapper = new ObjectMapper();

    public CollectionsApp(RDFConnection rdf) {
        this.service = new CollectionsService(rdf, SecurityUtil::userInfo);
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

                if (result == null) {
                    res.status(400);
                    return null;
                }

                res.type(APPLICATION_JSON.asString());
                return mapper.writeValueAsString(result);
            });
            delete("/", (req, res) -> {
                var iri = req.queryParams("iri");
                service.delete(iri);
                return "";
            });
        });

        exception(JsonMappingException.class, (e, req, res) -> {
            res.body("Invalid request body");
            res.status(SC_BAD_REQUEST);
        });
        exception(IllegalArgumentException.class, (e, req, res) -> {
            res.body(e.getMessage());
            res.status(SC_BAD_REQUEST);
        });
    }
}
