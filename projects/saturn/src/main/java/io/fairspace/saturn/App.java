package io.fairspace.saturn;

import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.health.HealthServlet;
import io.fairspace.saturn.services.metadata.MetadataAPIServlet;
import io.fairspace.saturn.services.vocabulary.VocabularyAPIServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.cfg4j.provider.ConfigurationProviderBuilder;
import org.cfg4j.source.classpath.ClasspathConfigurationSource;
import org.cfg4j.source.compose.FallbackConfigurationSource;
import org.cfg4j.source.context.filesprovider.ConfigFilesProvider;
import org.cfg4j.source.files.FilesConfigurationSource;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Paths;

import static io.fairspace.saturn.auth.Security.createAuthenticator;
import static java.util.Collections.singletonList;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

public class App {
    private static ConfigFilesProvider configFilesProvider = () -> singletonList(Paths.get("./application.yaml"));
    private static Config CONFIG = new ConfigurationProviderBuilder()
            .withConfigurationSource(new FallbackConfigurationSource(
                    new ClasspathConfigurationSource(configFilesProvider),
                    new FilesConfigurationSource(configFilesProvider)))
            .build()
            .bind("saturn", Config.class);

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG);
        var connection = new RDFConnectionLocal(ds);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addServlet("/statements", new MetadataAPIServlet(connection))
                .addServlet("/vocabulary", new VocabularyAPIServlet(connection, CONFIG.vocabularyURI()))
                .addServlet("/health", new HealthServlet())
                .port(CONFIG.port());

        if (CONFIG.authEnabled()) {
            var authenticator = createAuthenticator(CONFIG.jwksUrl());
            fusekiServerBuilder.securityHandler(new ConstraintSecurityHandler() {
                @Override
                public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
                    if (!"/health".equals(pathInContext)) {
                        var userInfo = authenticator.apply(request);
                        if (userInfo == null) {
                            response.sendError(SC_UNAUTHORIZED);
                            baseRequest.setHandled(true);
                            return;
                        }
                        // TODO: Check roles
                    }
                    super.handle(pathInContext, baseRequest, request, response);
                }
            });
        }

        fusekiServerBuilder
                .build()
                .start();

        System.out.println("Saturn is running on port " + CONFIG.port());
        System.out.println("Access Fuseki at /rdf");
        System.out.println("Access Metadata at /statements");
        System.out.println("Access Vocabulary API at /vocabulary");
    }
}
