package io.fairspace.saturn;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import static io.fairspace.saturn.config.ApiFilterFactory.createApiFilter;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SecurityHandlerFactory.getSecurityHandler;
import static io.fairspace.saturn.config.WebDAVServletFactory.initWebDAVServlet;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;

@Slf4j
public class App {
    private static final String API_VERSION = "v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, SaturnSecurityHandler::userInfo);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds, Isolation.COPY);
        initVocabularies(rdf);

        var apiPathPrefix = "/api/" + API_VERSION;
        var webDavPathPrefix = "/webdav/" + API_VERSION + "/";

        var svc = new Services(CONFIG, rdf, SaturnSecurityHandler::userInfo);

        FusekiServer.create()
                .securityHandler(getSecurityHandler(apiPathPrefix, CONFIG.auth, svc))
                .add(apiPathPrefix + "/rdf/", ds, false)
                .addFilter(apiPathPrefix + "/*", createApiFilter(apiPathPrefix, svc, CONFIG))
                .addServlet(webDavPathPrefix + "*", initWebDAVServlet(webDavPathPrefix, rdf, svc, CONFIG.webDAV))
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
