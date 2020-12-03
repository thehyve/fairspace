package io.fairspace.saturn;

import io.fairspace.saturn.auth.SaturnSecurityHandler;
import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.*;
import lombok.extern.log4j.*;
import org.apache.jena.fuseki.main.FusekiServer;
import org.eclipse.jetty.server.session.SessionHandler;

import java.sql.*;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

@Log4j2
public class App {
    public static final String API_PREFIX = "/api";

    public static void main(String[] args) {
        log.info("Saturn is starting");

        ViewStoreClient viewStoreClient = null;
        if (CONFIG.viewDatabase.enabled) {
            try {
                viewStoreClient = ViewStoreClientFactory.build(VIEWS_CONFIG, CONFIG.viewDatabase);
            } catch (SQLException e) {
                log.error("Error connecting to the view database.", e);
                throw new RuntimeException("Error connecting to the view database", e); // Terminates Saturn
            }
        }
        var ds = SaturnDatasetFactory.connect(
                CONFIG.jena,
                viewStoreClient
        );

        var svc = new Services(CONFIG, VIEWS_CONFIG, ds, viewStoreClient);

        var serverBuilder = FusekiServer.create()
                .securityHandler(new SaturnSecurityHandler(CONFIG.auth))
                .add(API_PREFIX + "/rdf/", svc.getFilteredDatasetGraph(), false)
                .addServlet(API_PREFIX + "/webdav/*", svc.getDavServlet())
                .addFilter( "/*", createSparkFilter(API_PREFIX, svc, CONFIG))
                .port(CONFIG.port)
                .enableCors(true);
        var server = serverBuilder
                .build();

        server.getJettyServer().insertHandler(new SessionHandler());

        server.start();

        log.info("Saturn has started");
    }
}
