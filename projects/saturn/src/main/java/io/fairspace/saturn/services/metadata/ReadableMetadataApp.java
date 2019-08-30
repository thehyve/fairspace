package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.metadata.serialization.GraphVizSerializer;
import io.fairspace.saturn.services.metadata.serialization.RDFSerializer;
import io.fairspace.saturn.services.metadata.serialization.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import spark.Request;

import java.util.List;

import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static org.apache.jena.riot.RDFFormat.TURTLE;
import static spark.Spark.get;


@Slf4j
public class ReadableMetadataApp extends BaseApp {
    private final ReadableMetadataService api;
    private static final List<Serializer> serializers = List.of(
            new RDFSerializer(JSONLD),
            new RDFSerializer(TURTLE),
            new GraphVizSerializer()
    );

    public ReadableMetadataApp(String basePath, ReadableMetadataService api) {
        super(basePath);

        this.api = api;
    }

    @Override
    protected void initApp() {
        serializers.forEach(serializer -> {
            var mimeType = serializer.getMimeType();
            get("/", mimeType, (req, res) -> {
                res.type(mimeType);
                return serializer.serialize(getMetadata(req));
            });
            get("/entities/", mimeType, (req, res) -> {
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
