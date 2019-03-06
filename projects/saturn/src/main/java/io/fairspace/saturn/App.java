package io.fairspace.saturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.services.collections.CollectionsApp;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.vfs.SafeFileSystem;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.io.IOException;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
public class App {
    private static final Config config = loadConfig();

    public static void main(String[] args) {
        log.info("Saturn is starting");

        setWorkspaceURI(config.jena.baseIRI);

        var vocabularyGraphNode = createURI(config.jena.baseIRI + "vocabulary");
        var metaVocabularyGraphNode = createURI(config.jena.baseIRI + "metavocabulary");

        var ds = SaturnDatasetFactory.connect(config.jena, vocabularyGraphNode);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds);

        var collections = new CollectionsService(rdf, SecurityUtil::userInfo);
        var fs = new SafeFileSystem(new ManagedFileSystem(rdf, new LocalBlobStore(new File(config.webDAV.blobStorePath)), SecurityUtil::userInfo, collections));

        // Setup and initialize vocabularies
        Vocabulary vocabulary = new Vocabulary(rdf, vocabularyGraphNode);
        vocabulary.initializeDefault("vocabulary.jsonld");

        Vocabulary metaVocabulary = new Vocabulary(rdf, metaVocabularyGraphNode);
        vocabulary.initializeDefault("metavocabulary.jsonld");

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addFilter("/api/*", new SaturnSparkFilter(
                        new MetadataApp("/api/metadata", rdf, defaultGraphIRI, vocabulary),
                        new MetadataApp("/api/vocabulary", rdf, createURI(config.jena.baseIRI + "vocabulary"), metaVocabulary),
                        new CollectionsApp(collections),
                        //    new VocabularyApp(rdf),
                        new HealthApp()))
                .addServlet("/webdav/*", new MiltonWebDAVServlet("/webdav/", fs))
                .port(config.port);

        var auth = config.auth;
        if (auth.enabled) {
            var authenticator = createAuthenticator(auth.jwksUrl, auth.jwtAlgorithm);
            fusekiServerBuilder.securityHandler(new SaturnSecurityHandler(authenticator));
        }

        fusekiServerBuilder
                .build()
                .start();

        log.info("Saturn is running on port " + config.port);
        log.info("Access Fuseki at /rdf/");
        log.info("Access Metadata at /api/metadata/");
        log.info("Access Vocabulary API at /api/vocabulary/");
        log.info("Access Collections API at /api/collections/");
        log.info("Access WebDAV API at /webdav/");
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
