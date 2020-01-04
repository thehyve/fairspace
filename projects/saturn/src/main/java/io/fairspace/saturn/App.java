package io.fairspace.saturn;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.config.ApiFilterFactory.createApiFilter;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ContextHandlerFactory.getContextHandler;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;

@Slf4j
public class App {
    public static final String API_PREFIX = "/api/v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG);

        initVocabularies(ds);

        var svc = new Services(CONFIG, ds, () -> getThreadContext().getUserInfo());

        FusekiServer.create()
                // The easiest way to add a top-level handler to Fuseki
                .securityHandler(getContextHandler(CONFIG.auth, svc))
                .add(API_PREFIX + "/rdf/", ds, false)
                .addFilter(API_PREFIX + "/*", createApiFilter(API_PREFIX, svc, CONFIG))
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
