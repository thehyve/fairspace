package io.fairspace.saturn;

import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.health.HealthServlet;
import io.fairspace.saturn.services.metadata.MetadataAPIServlet;
import io.fairspace.saturn.services.vocabulary.VocabularyAPIServlet;
import io.fairspace.saturn.webdav.milton.MiltonWebDAVServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.yaml.snakeyaml.Yaml;

import java.nio.file.Paths;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static java.util.Collections.singletonList;
import java.io.File;
import java.io.FileInputStream;

public class App {
    private static ConfigFilesProvider configFilesProvider = () -> singletonList(Paths.get("./application.yaml"));
    private static Config config = new ConfigurationProviderBuilder()
            .withConfigurationSource(new FallbackConfigurationSource(
                    new ClasspathConfigurationSource(configFilesProvider),
                    new FilesConfigurationSource(configFilesProvider)))
            .build()
            .bind("saturn", Config.class);
    private static Config config = loadConfig();

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(config);
        // The RDF connection is supposed to be threadsafe and can
        // be reused in all the application
        var connection = new RDFConnectionLocal(ds);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addServlet("/statements", new MetadataAPIServlet(connection))
                .addServlet("/vocabulary", new VocabularyAPIServlet(connection, config.vocabularyURI()))
                .addServlet("/webdav/*", new MiltonWebDAVServlet("/webdav", connection))
                .addServlet("/health", new HealthServlet())
                .port(config.port());

        if (config.authEnabled()) {
            var authenticator = createAuthenticator(config.jwksUrl(), config.jwtAlgorithm());
            fusekiServerBuilder.securityHandler(new SaturnSecurityHandler(authenticator));
        }

        fusekiServerBuilder
                .build()
                .start();

        System.out.println("Saturn is running on port " + config.port());
        System.out.println("Access Fuseki at /rdf");
        System.out.println("Access Metadata at /statements");
        System.out.println("Access Vocabulary API at /vocabulary");
    }

    private static Config loadConfig() {
        var settingsFile = new File("application.yaml");

        try(var is = settingsFile.exists() ? new FileInputStream(settingsFile) : App.class.getClassLoader().getResourceAsStream("application.yaml")) {
            return new Yaml().loadAs(is, Config.class);
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}
