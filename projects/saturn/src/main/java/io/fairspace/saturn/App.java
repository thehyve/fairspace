package io.fairspace.saturn;

import io.fairspace.saturn.auth.SaturnSecurityHandler;
import io.fairspace.saturn.config.Feature;
import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.eclipse.jetty.server.session.SessionHandler;

import java.sql.*;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.SEARCH_CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

@Slf4j
public class App {
    public static final String API_PREFIX = "/api/v1";

    public static void main(String[] args) {
        log.info("Saturn is starting");

        ViewStoreClient viewStoreClient = null;
        if (CONFIG.features.contains(Feature.Views)) {
            try {
                viewStoreClient = ViewStoreClientFactory.build(SEARCH_CONFIG);
            } catch (SQLException e) {
                log.error("Error connecting to the view database.", e);
                throw new RuntimeException("Error connecting to the view database", e); // Terminates Saturn
            }
        }
        var ds = SaturnDatasetFactory.connect(
                CONFIG.jena,
                CONFIG.features.contains(Feature.MetadataEditing),
                viewStoreClient
        );

        var svc = new Services(API_PREFIX, CONFIG, ds, viewStoreClient);

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
