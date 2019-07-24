package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;

import static io.fairspace.saturn.services.JsonLDUtils.JSON_LD_HEADER_STRING;
import static io.fairspace.saturn.services.JsonLDUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static spark.Spark.get;
import static spark.Spark.path;

@AllArgsConstructor
@Slf4j
public class ReadableMetadataApp extends BaseApp {
    protected final String basePath;
    protected final ReadableMetadataService api;

    @Override
    public void init() {
        super.init();

        path(basePath, () -> {
            get("/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSON_LD_HEADER_STRING);

                Model model = api.get(
                        req.queryParams("subject"),
                        req.queryParams("predicate"),
                        req.queryParams("object"),
                        req.queryParams().contains("includeObjectProperties"));

                // Return 404 if the model is empty, i.e. when the entity was not found
                return model.isEmpty() ? null : toJsonLD(model);
            });
            get("/entities/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSON_LD_HEADER_STRING);
                return toJsonLD(api.getByType(req.queryParams("type"), req.queryParams().contains("catalog")));
            });
            exception(TooManyTriplesException.class, exceptionHandler(SC_BAD_REQUEST, "Your query returned too many results"));
        });
    }

}
