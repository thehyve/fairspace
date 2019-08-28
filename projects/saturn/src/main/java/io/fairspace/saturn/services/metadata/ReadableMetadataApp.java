package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.metadata.serialization.GraphVizSerializer;
import io.fairspace.saturn.services.metadata.serialization.JsonLdSerializer;
import io.fairspace.saturn.services.metadata.serialization.Serializer;
import io.fairspace.saturn.services.metadata.serialization.TurtleSerializer;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import spark.Request;

import java.util.Map;

import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.services.metadata.serialization.GraphVizSerializer.GRAPHVIZ_MIMETYPE;
import static io.fairspace.saturn.services.metadata.serialization.JsonLdSerializer.JSON_LD_HEADER_STRING;
import static io.fairspace.saturn.services.metadata.serialization.TurtleSerializer.TURTLE_HEADER_STRING;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static spark.Spark.get;


@Slf4j
public class ReadableMetadataApp extends BaseApp {
    private final ReadableMetadataService api;
    private static final Map<String, Serializer> serializers = Map.of(
            JSON_LD_HEADER_STRING, new JsonLdSerializer(),
            TURTLE_HEADER_STRING, new TurtleSerializer(),
            GRAPHVIZ_MIMETYPE, new GraphVizSerializer()
    );

    public ReadableMetadataApp(String basePath, ReadableMetadataService api) {
        super(basePath);

        this.api = api;
    }

    @Override
    protected void initApp() {
        serializers.forEach((mimeType, serializer) -> {
            get("/", mimeType, (req, res) -> {
                res.type(mimeType);
                return serializer.serialize(getMetadata(req));
            });
            get("/entities/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(mimeType);
                return serializer.serialize(api.getByType(req.queryParams("type"), req.queryParams().contains("catalog")));
            });
        });
        exception(TooManyTriplesException.class, exceptionHandler(SC_BAD_REQUEST, "Your query returned too many results"));
    }

    protected Model getMetadata(Request req) {
        return api.get(
                req.queryParams("subject"),
                req.queryParams("predicate"),
                req.queryParams("object"),
                req.queryParams().contains("includeObjectProperties"));
    }
}
