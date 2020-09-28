package io.fairspace.saturn;

import io.fairspace.saturn.auth.SaturnSecurityHandler;
import io.fairspace.saturn.config.Feature;
import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.eclipse.jetty.server.session.SessionHandler;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

@Slf4j
public class App {
    public static final String API_PREFIX = "/api/v1";

    public static void main(String[] args) {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, CONFIG.features.contains(Feature.MetadataEditing));

        var svc = new Services(API_PREFIX, CONFIG, ds);

        var serverBuilder = FusekiServer.create()
                .securityHandler(new SaturnSecurityHandler(CONFIG.auth))
                .add(API_PREFIX + "/rdf/", svc.getFilteredDatasetGraph(), false)
                .addServlet(API_PREFIX + "/webdav/*", svc.getDavServlet())
                .addServlet(API_PREFIX + "/search/*", svc.getSearchProxyServlet())
                .addFilter( "/*", createSparkFilter(API_PREFIX, svc, CONFIG))
                .port(CONFIG.port);
        var server = serverBuilder
                .build();

        server.getJettyServer().insertHandler(new SessionHandler());

        server.start();

        log.info("Saturn has started");
    }

}
