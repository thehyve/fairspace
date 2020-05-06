package io.fairspace.saturn;

import io.fairspace.saturn.auth.SaturnSecurityHandler;
import io.fairspace.saturn.auth.UserIdentityFilter;
import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.webdav.WebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.eclipse.jetty.proxy.ProxyServlet;
import org.eclipse.jetty.server.session.SessionHandler;

import javax.servlet.http.HttpServletRequest;

import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;

@Slf4j
public class App {
    public static final String API_PREFIX = "/api/v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena);

        var svc = new Services(CONFIG, ds);

        var server = FusekiServer.create()
                .securityHandler(new SaturnSecurityHandler(CONFIG.auth))
                .add(API_PREFIX + "/rdf/", ds, false)
                .addFilter("/*", new UserIdentityFilter(svc))
                .addServlet(API_PREFIX + "/webdav/*", new WebDAVServlet(svc))
                .addServlet(API_PREFIX + "/search/*", new ProxyServlet() {
                    @Override
                    protected String rewriteTarget(HttpServletRequest clientRequest) {
                        return clientRequest.getRequestURI().replace(API_PREFIX + "/search", CONFIG.elasticsearchUrl);
                    }
                })
                .addFilter( "/*", createSparkFilter(API_PREFIX, svc, CONFIG))
                .port(CONFIG.port)
                .build();

        server.getJettyServer().insertHandler(new SessionHandler());

        server.start();

        log.info("Saturn has started");
    }

}
