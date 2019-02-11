package io.fairspace.saturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.collections.CollectionsApp;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.services.vocabulary.VocabularyApp;
import io.fairspace.saturn.vfs.SafeFileSystem;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.io.IOException;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;

public class App {
    private static final Config config = loadConfig();

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(config.jena);
        // The RDF connection is supposed to be threadsafe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds);

        var collections = new CollectionsService(rdf, config.jena.baseURI, SecurityUtil::userInfo);
        var fs = new SafeFileSystem(new ManagedFileSystem(rdf, new LocalBlobStore(new File(config.webDAV.blobStorePath)), config.jena.baseURI, SecurityUtil::userInfo, collections));

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addFilter("/api/*", new SaturnSparkFilter(
                        new MetadataApp(rdf),
                        new CollectionsApp(collections),
                        new VocabularyApp(rdf, config.jena.baseURI),
                        new HealthApp()))
                .addServlet("/webdav/*", new MiltonWebDAVServlet(fs))
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
        System.out.println("Access Metadata at /api/meta");
        System.out.println("Access Vocabulary API at /api/vocabulary");
        System.out.println("Access Collections API at /api/collections");
        System.out.println("Access WebDAV API at /webdav");
    }

    private static Config loadConfig() {
        var settingsFile = new File("application.yaml");
        if (settingsFile.exists()) {
            try {
                return new ObjectMapper(new YAMLFactory()).readValue(settingsFile, Config.class);
            } catch (IOException e) {
                throw new RuntimeException("Error loading configuration", e);
            }
        }
        return new Config();
    }
}
