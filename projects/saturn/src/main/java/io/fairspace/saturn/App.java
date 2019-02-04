package io.fairspace.saturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.health.HealthServlet;
import io.fairspace.saturn.services.metadata.MetadataAPIServlet;
import io.fairspace.saturn.services.vocabulary.VocabularyAPIServlet;
import io.fairspace.saturn.webdav.milton.MiltonWebDAVServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.io.FileInputStream;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;

public class App {
    private static Config config = loadConfig();

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(config.jena);
        // The RDF connection is supposed to be threadsafe and can
        // be reused in all the application
        var connection = new RDFConnectionLocal(ds);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addServlet("/statements", new MetadataAPIServlet(connection))
                .addServlet("/vocabulary", new VocabularyAPIServlet(connection, config.jena.vocabularyURI))
                .addServlet("/webdav/*", new MiltonWebDAVServlet("/webdav", connection))
                .addServlet("/health", new HealthServlet())
                .port(config.port);

        var auth = config.auth;
        if (auth.authEnabled) {
            var authenticator = createAuthenticator(auth.jwksUrl, auth.jwtAlgorithm);
            fusekiServerBuilder.securityHandler(new SaturnSecurityHandler(authenticator));
        }

        fusekiServerBuilder
                .build()
                .start();

        System.out.println("Saturn is running on port " + config.port);
        System.out.println("Access Fuseki at /rdf");
        System.out.println("Access Metadata at /statements");
        System.out.println("Access Vocabulary API at /vocabulary");
    }

    private static Config loadConfig() {
        var mapper = new ObjectMapper(new YAMLFactory());
        var settingsFile = new File("application.yaml");

        try(var is = settingsFile.exists()
                ? new FileInputStream(settingsFile)
                : App.class.getClassLoader().getResourceAsStream("application.yaml")) {
            return mapper.readValue(is, Config.class);
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}
