package io.fairspace.saturn.services.metadata;


import io.fairspace.saturn.services.BaseApp;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static io.fairspace.saturn.services.ModelUtils.JSON_LD_HEADER_STRING;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.get;
import static spark.Spark.path;

@AllArgsConstructor
@Slf4j
public class ReadableMetadataApp extends BaseApp {
    protected final String basePath;
    protected final MetadataSource metadataSource;

    @Override
    public void init() {
        super.init();

        path(basePath, () -> {
            get("/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSON_LD_HEADER_STRING);
                return toJsonLD(metadataSource.get(
                        req.queryParams("subject"),
                        req.queryParams("predicate"),
                        req.queryParams("object"),
                        req.queryParams().contains("labels")));
            });
            get("/entities/", JSON_LD_HEADER_STRING, (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(metadataSource.getByType(req.queryParams("type")));
            });
        });
    }

}
