package io.fairspace.saturn;

import java.sql.SQLException;

import lombok.extern.log4j.Log4j2;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

@Log4j2
public class FusekiConfig {
    public static final String API_PREFIX = "/api";

    public void initSaturn() {
        log.info("Saturn is starting");
        ViewStoreClientFactory viewStoreClientFactory = null;
        if (CONFIG.viewDatabase.enabled) {
            try {
                viewStoreClientFactory = new ViewStoreClientFactory(VIEWS_CONFIG, CONFIG.viewDatabase, CONFIG.search);
            } catch (SQLException e) {
                log.error("Error connecting to the view database.", e);
                throw new RuntimeException("Error connecting to the view database", e); // Terminates Saturn
            }
        }
        var ds = SaturnDatasetFactory.connect(CONFIG.jena, viewStoreClientFactory);

        var svc = new Services(CONFIG, VIEWS_CONFIG, ds, viewStoreClientFactory);

        // todo: add security
        // todo: add restriction for write operations
        // todo: add SPARQL query endpoint
        // todo: add WebDAV servlet
        // todo: add Spark filter
        // todo: change port number
        //        var operationRegistry = OperationRegistry.createStd();
        //        operationRegistry.register(
        //                Operation.Query,
        //                WebContent.contentTypeSPARQLQuery,
        //                new Protected_SPARQL_QueryDataset(svc.getUserService()));
        //        var serverBuilder = FusekiServer.create(operationRegistry)
        //                .securityHandler(new SaturnSecurityHandler(CONFIG.auth))
        //                .add(API_PREFIX + "/rdf/", svc.getFilteredDatasetGraph(), false)
        //                .addServlet(API_PREFIX + "/webdav/*", svc.getDavServlet())
        //                .addFilter("/*", createSparkFilter(API_PREFIX, svc, CONFIG))
        //                .port(CONFIG.port);
        // todo: add extra storage
        //        if (CONFIG.features.contains(Feature.ExtraStorage)) {
        //            serverBuilder.addServlet(API_PREFIX + "/extra-storage/*", svc.getExtraDavServlet());
        //        }

        //        var server = serverBuilder.build();
        //        server.getJettyServer().insertHandler(new SessionHandler());
        //        server.start();
        log.info("Saturn has started");
    }

    //    public static void main(String[] args) {
    //        try (var ignored = new LivenessServer()) {
    //            var fusekiServer = startFusekiServer();
    //            fusekiServer.join();
    //        } catch (Throwable e) {
    //            throw new RuntimeException("Saturn ended unexpectedly", e);
    //        }
    //    }
}
