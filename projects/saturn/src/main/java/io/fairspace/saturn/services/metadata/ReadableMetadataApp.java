package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import lombok.extern.slf4j.Slf4j;

import static io.fairspace.saturn.services.JsonLDUtils.JSON_LD_HEADER_STRING;
import static io.fairspace.saturn.services.JsonLDUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static spark.Spark.get;


@Slf4j
public class ReadableMetadataApp extends BaseApp {
    private final ReadableMetadataService api;

    public ReadableMetadataApp(String basePath, ReadableMetadataService api) {
        super(basePath);

        this.api = api;
    }

    @Override
    protected void initApp() {
        get("/", JSON_LD_HEADER_STRING, (req, res) -> {
            res.type(JSON_LD_HEADER_STRING);
            return toJsonLD(api.get(
                    req.queryParams("subject"),
                    req.queryParams("predicate"),
                    req.queryParams("object"),
                    req.queryParams().contains("includeObjectProperties")));
        });
        get("/entities/", JSON_LD_HEADER_STRING, (req, res) -> {
            res.type(JSON_LD_HEADER_STRING);
            return toJsonLD(api.getByType(req.queryParams("type"), req.queryParams().contains("catalog")));
        });
        exception(TooManyTriplesException.class, exceptionHandler(SC_BAD_REQUEST, "Your query returned too many results"));
    }
}
