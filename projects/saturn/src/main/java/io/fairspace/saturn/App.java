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
import io.fairspace.saturn.services.metadata.*;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.PermissionCheckingValidator;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.services.permissions.PermissionsApp;
import io.fairspace.saturn.services.permissions.PermissionsServiceImpl;
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

        var userVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "user-vocabulary");
        var systemVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "system-vocabulary");
        var metaVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "meta-vocabulary");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, userVocabularyGraphNode);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds);

        var eventBus = new EventBus();

        var userService = new UserService(new DAO(rdf, null));
        Supplier<Node> userIriSupplier = () -> userService.getUserIRI(userInfo());
        var permissions = new PermissionsServiceImpl(rdf, userIriSupplier);
        var collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus::post, permissions);
        var blobStore = new LocalBlobStore(new File(CONFIG.webDAV.blobStorePath));
        var fs = new SafeFileSystem(new ManagedFileSystem(rdf, blobStore, userIriSupplier, collections, eventBus, permissions));

        var lifeCycleManager = new MetadataEntityLifeCycleManager(rdf, defaultGraphIRI, userIriSupplier, permissions);

        // Setup and initialize vocabularies
        var userVocabulary = createVocabulary(rdf, userVocabularyGraphNode, "default-vocabularies/user-vocabulary.ttl");
        var systemVocabulary = createVocabulary(rdf, systemVocabularyGraphNode, "default-vocabularies/system-vocabulary.ttl");
        var metaVocabulary = createVocabulary(rdf, metaVocabularyGraphNode, "default-vocabularies/meta-vocabulary.ttl");

        var metadataValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(systemVocabulary),
                new PermissionCheckingValidator(permissions, systemVocabulary, userVocabulary));

        var metadataService = new ChangeableMetadataService(rdf, defaultGraphIRI, lifeCycleManager, metadataValidator);
        var userVocabularyService = new ChangeableMetadataService(rdf, userVocabularyGraphNode, lifeCycleManager, new ProtectMachineOnlyPredicatesValidator(metaVocabulary));
        var systemVocabularyService = new ReadableMetadataService(rdf, systemVocabularyGraphNode);
        var metaVocabularyService = new ReadableMetadataService(rdf, metaVocabularyGraphNode);

        var vocabularyAuthorizationVerifier = new VocabularyAuthorizationVerifier(SecurityUtil::userInfo, CONFIG.auth.dataStewardRole);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addFilter("/api/*", new SaturnSparkFilter(
                        new ChangeableMetadataApp("/api/metadata", metadataService),
                        new ChangeableMetadataApp("/api/vocabulary/user", userVocabularyService)
                            .withAuthorizationVerifier("/api/vocabulary/user/*", vocabularyAuthorizationVerifier),
                        new ReadableMetadataApp("/api/vocabulary/system", systemVocabularyService),
                        new ReadableMetadataApp("/api/vocabulary/meta", metaVocabularyService),
                        new CollectionsApp(collections),
                        new PermissionsApp(permissions),
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

        log.info("Saturn has started");
    }
}
