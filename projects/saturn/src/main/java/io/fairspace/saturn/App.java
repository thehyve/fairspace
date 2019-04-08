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
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.*;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.PermissionCheckingValidator;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.services.metadata.validation.ShaclValidator;
import io.fairspace.saturn.services.permissions.PermissionsApp;
import io.fairspace.saturn.services.permissions.PermissionsServiceImpl;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.vocabulary.Vocabularies;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.io.IOException;
import java.util.function.Supplier;

import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static io.fairspace.saturn.auth.SecurityUtil.userInfo;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
public class App {
    public static void main(String[] args) throws IOException {
        log.info("Saturn is starting");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, VOCABULARY_GRAPH_URI);

        // The RDF connection is supposed to be thread-safe and can
        // be reused in all the application
        var rdf = new RDFConnectionLocal(ds);

        var eventBus = new EventBus();

        var userService = new UserService(SecurityUtil::userInfo, new DAO(rdf, null));
        Supplier<Node> userIriSupplier = () -> userService.getUserIRI(userInfo());
        var mailService = new MailService(CONFIG.mail);

        var permissions = new PermissionsServiceImpl(rdf, userService, mailService);
        var collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus::post, permissions);
        var blobStore = new LocalBlobStore(new File(CONFIG.webDAV.blobStorePath));
        var fs = new ManagedFileSystem(rdf, blobStore, userIriSupplier, collections, eventBus, permissions);

        var lifeCycleManager = new MetadataEntityLifeCycleManager(rdf, defaultGraphIRI, userIriSupplier, permissions);

        var vocabularies = new Vocabularies(rdf);

        var metadataValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(() -> vocabularies.getMachineOnlyPredicates(VOCABULARY_GRAPH_URI)),
                new PermissionCheckingValidator(rdf, permissions),
                new ShaclValidator(rdf, defaultGraphIRI, VOCABULARY_GRAPH_URI));

        var metadataService = new ChangeableMetadataService(rdf, defaultGraphIRI, VOCABULARY_GRAPH_URI, lifeCycleManager, metadataValidator);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(() -> vocabularies.getMachineOnlyPredicates(META_VOCABULARY_GRAPH_URI)),
                new ShaclValidator(rdf, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI)
        );
        var userVocabularyService = new ChangeableMetadataService(rdf, VOCABULARY_GRAPH_URI, VOCABULARY_GRAPH_URI, lifeCycleManager, vocabularyValidator);
        var metaVocabularyService = new ReadableMetadataService(rdf, META_VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);

        var vocabularyAuthorizationVerifier = new VocabularyAuthorizationVerifier(SecurityUtil::userInfo, CONFIG.auth.dataStewardRole);

        var fusekiServerBuilder = FusekiServer.create()
                .add("rdf", ds)
                .addFilter("/api/*", new SaturnSparkFilter(
                        new ChangeableMetadataApp("/api/metadata", metadataService),
                        new ChangeableMetadataApp("/api/vocabulary/", userVocabularyService)
                            .withAuthorizationVerifier("/api/vocabulary/*", vocabularyAuthorizationVerifier),
                        new ReadableMetadataApp("/api/vocabulary/meta-vocabulary/", metaVocabularyService),
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
