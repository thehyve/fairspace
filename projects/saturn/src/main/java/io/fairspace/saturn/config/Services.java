package io.fairspace.saturn.config;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.ChangeableMetadataService;
import io.fairspace.saturn.services.metadata.MetadataEntityLifeCycleManager;
import io.fairspace.saturn.services.metadata.ReadableMetadataService;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.permissions.PermissionNotificationHandler;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.vfs.AuditedFileSystem;
import io.fairspace.saturn.vfs.CompoundFileSystem;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vfs.managed.BlobStore;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.Dataset;

import java.io.File;
import java.util.Map;

import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
@Getter
public class Services {
    private final Config config;
    private final Transactions transactions;

    private final EventBus eventBus = new EventBus();
    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final MailService mailService;
    private final PermissionsService permissionsService;
    private final CollectionsService collectionsService;
    private final ChangeableMetadataService metadataService;
    private final ChangeableMetadataService userVocabularyService;
    private final ReadableMetadataService metaVocabularyService;
    private final BlobStore blobStore;
    private final VirtualFileSystem fileSystem;


    public Services(@NonNull Config config, @NonNull Dataset dataset) {
        this.config = config;
        this.transactions = config.jena.bulkTransactions ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);

        userService = new UserService(config.auth, transactions);

        mailService = new MailService(config.mail);
        var permissionNotificationHandler = new PermissionNotificationHandler(transactions, userService, mailService, config.publicUrl);
        permissionsService = new PermissionsService(transactions, permissionNotificationHandler);

        workspaceService = new WorkspaceService(transactions, permissionsService);
        collectionsService = new CollectionsService(config.publicUrl + "/api/v1/webdav/", transactions, eventBus::post, permissionsService);

        var metadataLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, defaultGraphIRI, VOCABULARY_GRAPH_URI, permissionsService);

        var metadataValidator = new ComposedValidator(
                new MachineOnlyClassesValidator(),
                new ProtectMachineOnlyPredicatesValidator(),
                new PermissionCheckingValidator(permissionsService),
                new DeletionValidator(),
                new WorkspaceStatusValidator(),
                new ShaclValidator());

        metadataService = new ChangeableMetadataService(transactions, defaultGraphIRI, VOCABULARY_GRAPH_URI, config.jena.maxTriplesToReturn, metadataLifeCycleManager, metadataValidator);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(),
                new DeletionValidator(),
                new ShaclValidator(),
                new SystemVocabularyProtectingValidator(),
                new MetadataAndVocabularyConsistencyValidator(dataset),
                new InverseForUsedPropertiesValidator(dataset)
        );

        var vocabularyLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, permissionsService);

        userVocabularyService = new ChangeableMetadataService(transactions, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, 0, vocabularyLifeCycleManager, vocabularyValidator);
        metaVocabularyService = new ReadableMetadataService(transactions, META_VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);

        blobStore = new LocalBlobStore(new File(config.webDAV.blobStorePath));
        fileSystem = new AuditedFileSystem(new CompoundFileSystem(collectionsService, Map.of(
                ManagedFileSystem.TYPE, new ManagedFileSystem(transactions, blobStore, () -> getCurrentUser().getIri(), collectionsService, eventBus, permissionsService))));
    }
}
