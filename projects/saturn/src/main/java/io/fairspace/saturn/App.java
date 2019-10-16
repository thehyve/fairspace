package io.fairspace.saturn;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.ApiFilterFactory;
import io.fairspace.saturn.config.SecurityHandlerFactory;
import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.config.WebDAVServletFactory;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.transactions.TransactionalBatchExecutorService;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.util.function.Supplier;

import static io.fairspace.saturn.Context.threadContext;
import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static java.util.Optional.ofNullable;

@Slf4j
public class App {
    private static final String API_VERSION = "v1";

    public static void main(String[] args) throws Exception {
        log.info("Saturn is starting");

        Supplier<OAuthAuthenticationToken> userInfoProvider = () -> ofNullable(threadContext.get()).map(Context::getUserInfo).orElse(null);

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, threadContext::get);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds, Isolation.COPY);
        initVocabularies(rdf, new TransactionalBatchExecutorService(rdf));

        var apiPathPrefix = "/api/" + API_VERSION;
        var webDavPathPrefix = "/webdav/" + API_VERSION + "/";

        var svc = new Services(CONFIG, rdf, userInfoProvider);

        FusekiServer.create()
                .securityHandler(SecurityHandlerFactory.getSecurityHandler(apiPathPrefix, CONFIG.auth, svc))
                .add(apiPathPrefix + "/rdf/", ds, false)
                .addFilter(apiPathPrefix + "/*", ApiFilterFactory.createApiFilter(apiPathPrefix, svc, CONFIG))
                .addServlet(webDavPathPrefix + "*", WebDAVServletFactory.initWebDAVServlet(webDavPathPrefix, rdf, svc, CONFIG.webDAV))
                .port(CONFIG.port)
                .build()
                .start();

        log.info("Saturn has started");
    }
}
