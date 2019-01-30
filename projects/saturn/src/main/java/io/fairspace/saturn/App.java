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

import java.nio.file.Paths;

import static io.fairspace.saturn.auth.Security.createAuthenticationFilter;
import static java.util.Collections.singletonList;

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
            var authFilter = createAuthenticationFilter(CONFIG.jwksUrl());
            fusekiServerBuilder.addFilter("/rdf", authFilter);
            fusekiServerBuilder.addFilter("/statements", authFilter);
            fusekiServerBuilder.addFilter("/vocabulary", authFilter);
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
