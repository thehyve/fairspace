package io.fairspace.saturn;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.webdav.WebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.proxy.ProxyServlet;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static io.fairspace.saturn.auth.SecurityHandlerFactory.createSecurityHandler;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.services.users.User.setCurrentUser;

@Slf4j
public class App {
    public static final String API_PREFIX = "/api/v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena);

        var svc = new Services(CONFIG, ds);

        FusekiServer.create()
                .securityHandler(createSecurityHandler(CONFIG.auth))
                .add(API_PREFIX + "/rdf/", ds, false)
                .addFilter("/*", new Filter() {
                    @Override
                    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
                        setCurrentUser(svc.getUserService().getUser(generateMetadataIri(((HttpServletRequest)request).getRemoteUser())));
                        chain.doFilter(request, response);
                    }

                    @Override
                    public void init(FilterConfig filterConfig) {}

                    @Override
                    public void destroy() {}
                })
                .addFilter(API_PREFIX + "/*", createSparkFilter(API_PREFIX, svc, CONFIG))
                .addServlet(API_PREFIX + "/webdav/*", new WebDAVServlet(svc))
                .addServlet(API_PREFIX + "/search/*", new ProxyServlet() {
                    @Override
                    protected String rewriteTarget(HttpServletRequest clientRequest) {
                        return clientRequest.getRequestURI().replace(API_PREFIX + "/search", CONFIG.elasticsearchUrl);
                    }

                    @Override
                    protected HttpClient createHttpClient() throws ServletException {
                        var client = super.createHttpClient();
                        client.setRequestBufferSize(64 * 1024);
                        return client;
                    }
                })
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
