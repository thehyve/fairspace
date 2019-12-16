package io.fairspace.saturn;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.config.ApiFilterFactory.createApiFilter;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SecurityHandlerFactory.getSecurityHandler;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;

@Slf4j
public class App {
    private static final String API_VERSION = "v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG);

        initVocabularies(ds);

        var svc = new Services(CONFIG, ds, () -> getThreadContext().getUserInfo());

        var apiPathPrefix = "/api/" + API_VERSION;
        var webDavPathPrefix = "/webdav/" + API_VERSION + "/";
        FusekiServer.create()
                .securityHandler(getSecurityHandler(apiPathPrefix, CONFIG.auth, svc))
                .add(apiPathPrefix + "/rdf/", ds, false)
                .addFilter(apiPathPrefix + "/*", createApiFilter(apiPathPrefix, svc, CONFIG))
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
