package io.fairspace.saturn;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.DatasetGraphMulti;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import static io.fairspace.saturn.config.ApiFilterFactory.createApiFilter;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SecurityHandlerFactory.getSecurityHandler;
import static io.fairspace.saturn.config.WebDAVServletFactory.initWebDAVServlet;

@Slf4j
public class App {
    private static final String API_VERSION = "v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var dsg = new DatasetGraphMulti(CONFIG.jena, SaturnSecurityHandler::userInfo);
        var ds  = DatasetFactory.wrap(dsg);
        var rdf = new RDFConnectionLocal(ds, Isolation.COPY);

        var apiPathPrefix = "/api/" + API_VERSION;
        var webDavPathPrefix = "/webdav/" + API_VERSION + "/";

        var svc = new Services(CONFIG, rdf, SaturnSecurityHandler::userInfo);

        FusekiServer.create()
                .securityHandler(getSecurityHandler(apiPathPrefix, CONFIG.auth, svc, dsg::connect))
                .add(apiPathPrefix + "/rdf/", ds, false)
                .addFilter(apiPathPrefix + "/*", createApiFilter(apiPathPrefix, svc, CONFIG))
                .addServlet(webDavPathPrefix + "*", initWebDAVServlet(webDavPathPrefix, rdf, svc, CONFIG.webDAV))
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
