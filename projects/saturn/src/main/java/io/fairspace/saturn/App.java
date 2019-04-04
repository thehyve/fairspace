package io.fairspace.saturn;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.auth.DummyAuthenticator;
import io.fairspace.saturn.auth.SecurityUtil;
import io.fairspace.saturn.auth.VocabularyAuthorizationVerifier;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.collections.CollectionsApp;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.*;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.permissions.PermissionsApp;
import io.fairspace.saturn.services.permissions.PermissionsServiceImpl;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.webdav.MiltonWebDAVServlet;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;

import java.io.File;
import java.io.IOException;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Supplier;

import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static io.fairspace.saturn.auth.SecurityUtil.userInfo;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.system.Txn.calculateRead;

@Slf4j
public class App {
    public static void main(String[] args) throws IOException {
        log.info("Saturn is starting");

        var userVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "user-vocabulary");
        var systemVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "system-vocabulary");
        var metaVocabularyGraphNode = createURI(CONFIG.jena.baseIRI + "meta-vocabulary");

        var ds = SaturnDatasetFactory.connect(CONFIG.jena, userVocabularyGraphNode);

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

        // Setup and initialize vocabularies
        var userVocabulary = Vocabulary.initializeVocabulary(rdf, userVocabularyGraphNode, "default-vocabularies/user-vocabulary.ttl");
        var systemVocabulary = Vocabulary.recreateVocabulary(rdf, systemVocabularyGraphNode, "default-vocabularies/system-vocabulary.ttl");
        var metaVocabulary = Vocabulary.recreateVocabulary(rdf, metaVocabularyGraphNode, "default-vocabularies/meta-vocabulary.ttl");

        Function<Model, Set<Resource>> affectedResourcesDetector = new AffectedResourcesDetector(systemVocabulary, userVocabulary)::getAffectedResources;
        Supplier<Model> mergedVocabularySupplier = () -> calculateRead(rdf, () ->
                rdf.fetch(systemVocabularyGraphNode.getURI())
                        .add(rdf.fetch(userVocabularyGraphNode.getURI())));

        var metadataValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(systemVocabulary),
                new PermissionCheckingValidator(permissions, affectedResourcesDetector),
                new ShaclValidator(rdf, defaultGraphIRI, mergedVocabularySupplier, affectedResourcesDetector));

        var metadataService = new ChangeableMetadataService(rdf, defaultGraphIRI, lifeCycleManager, metadataValidator);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(metaVocabulary),
                new ShaclValidator(rdf, userVocabularyGraphNode, () -> rdf.fetch(systemVocabularyGraphNode.getURI()), affectedResourcesDetector));

        var userVocabularyService = new ChangeableMetadataService(rdf, userVocabularyGraphNode, lifeCycleManager, vocabularyValidator);
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
