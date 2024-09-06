package io.fairspace.saturn;

import java.sql.SQLException;

import lombok.extern.log4j.Log4j2;

import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

@Log4j2
public class FusekiConfig {
    public static final String API_PREFIX = "/api";

    public void initSaturn() {

        // todo: add extra storage
        //        if (CONFIG.features.contains(Feature.ExtraStorage)) {
        //            serverBuilder.addServlet(API_PREFIX + "/extra-storage/*", svc.getExtraDavServlet());
        //        }

        log.info("Saturn has started");
    }

}
