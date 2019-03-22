package io.fairspace.saturn;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.auth.DummyAuthenticator;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.auth.VocabularyAuthorizationVerifier;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.collections.CollectionsApp;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.services.metadata.MetadataEntityLifeCycleManager;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vfs.SafeFileSystem;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.util.function.Supplier;

import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static io.fairspace.saturn.auth.SecurityUtil.userInfo;
import static io.fairspace.saturn.rdf.Vocabulary.createVocabulary;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
public class App {
    public static void main(String[] args) {
        log.info("Saturn is starting");

        var vocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "vocabulary");
        var metaVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "metavocabulary");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, vocabularyGraphNode);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds);

        var eventBus = new EventBus();

        var userService = new UserService(new DAO(rdf, null));
        Supplier<Node> userIriSupplier = () -> userService.getUserIRI(userInfo());
        var collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus);
        var blobStore = new LocalBlobStore(new File(CONFIG.webDAV.blobStorePath));
        var fs = new SafeFileSystem(new ManagedFileSystem(rdf, blobStore, userIriSupplier, collections, eventBus));

        // TODO: Add permissionsService implementation when VRE-490 is done
        var lifeCycleManager = new MetadataEntityLifeCycleManager(rdf, defaultGraphIRI, userIriSupplier, null);

        // Setup and initialize vocabularies
        var vocabulary = createVocabulary(rdf, vocabularyGraphNode, "vocabulary.jsonld");
        var metadataService = new MetadataService(rdf, defaultGraphIRI, lifeCycleManager, new ProtectMachineOnlyPredicatesValidator(vocabulary));

        var metaVocabulary = createVocabulary(rdf, metaVocabularyGraphNode, "metavocabulary.jsonld");
        var vocabularyService = new MetadataService(rdf, vocabularyGraphNode, lifeCycleManager, new ProtectMachineOnlyPredicatesValidator(metaVocabulary));
        var vocabularyAuthorizationVerifier = new VocabularyAuthorizationVerifier(SecurityUtil::userInfo, CONFIG.auth.dataStewardRole);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addFilter("/api/*", new SaturnSparkFilter(
                        new MetadataApp("/api/metadata", metadataService, null),
                        new MetadataApp("/api/vocabulary", vocabularyService, vocabularyAuthorizationVerifier),
                        new CollectionsApp(collections),
                        new HealthApp()))
                .addServlet("/webdav/*", new MiltonWebDAVServlet("/webdav/", fs))
                .port(CONFIG.port);

        var auth = CONFIG.auth;
        if (!auth.enabled) {
            log.warn("Authentication is disabled");
        }
        var authenticator = auth.enabled ? createAuthenticator(auth.jwksUrl, auth.jwtAlgorithm) : new DummyAuthenticator();
        fusekiServerBuilder.securityHandler(new SaturnSecurityHandler(authenticator, userService::getUserIRI));

        fusekiServerBuilder
                .build()
                .start();

        log.info("Saturn is running on port " + CONFIG.port);
        log.info("Access Fuseki at /rdf/");
        log.info("Access Metadata at /api/metadata/");
        log.info("Access Vocabulary API at /api/vocabulary/");
        log.info("Access Collections API at /api/collections/");
        log.info("Access WebDAV API at /webdav/");
    }
}
