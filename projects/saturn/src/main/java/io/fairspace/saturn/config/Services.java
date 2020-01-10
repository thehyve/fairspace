package io.fairspace.saturn.config;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.events.EventCategory;
import io.fairspace.saturn.events.EventService;
import io.fairspace.saturn.events.MetadataEvent;
import io.fairspace.saturn.events.RabbitMQEventService;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.ChangeableMetadataService;
import io.fairspace.saturn.services.metadata.MetadataEntityLifeCycleManager;
import io.fairspace.saturn.services.metadata.ReadableMetadataService;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.permissions.PermissionNotificationHandler;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.projects.ProjectsService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vfs.CompoundFileSystem;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vfs.irods.IRODSVirtualFileSystem;
import io.fairspace.saturn.vfs.managed.BlobStore;
import io.fairspace.saturn.vfs.managed.LocalBlobStore;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.Dataset;

import java.io.File;
import java.util.Map;
import java.util.function.Consumer;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
@Getter
public class Services {
    private final Config config;
    private final Dataset dataset;

    private final EventBus eventBus = new EventBus();
    private final ProjectsService projectsService;
    private final UserService userService;
    private final EventService eventService;
    private final MailService mailService;
    private final PermissionsService permissionsService;
    private final CollectionsService collectionsService;
    private final ChangeableMetadataService metadataService;
    private final ChangeableMetadataService userVocabularyService;
    private final ReadableMetadataService metaVocabularyService;
    private final BlobStore blobStore;
    private final VirtualFileSystem fileSystem;


    public Services(@NonNull Config config, @NonNull Dataset dataset) throws Exception {
        this.config = config;
        this.dataset = dataset;

        projectsService = new ProjectsService(config.jena.datasetPath);
        userService = new UserService(dataset, config.auth.fullAccessRole);

        eventService = setupEventService();

        mailService = new MailService(config.mail);
        var permissionNotificationHandler = new PermissionNotificationHandler(dataset, userService, mailService, config.publicUrl);
        permissionsService = new PermissionsService(dataset, permissionNotificationHandler, userService, eventService);

        collectionsService = new CollectionsService(dataset, eventBus::post, userService, permissionsService, eventService);

        var metadataLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, defaultGraphIRI, VOCABULARY_GRAPH_URI, userService, permissionsService);

        var metadataValidator = new ComposedValidator(
                new MachineOnlyClassesValidator(),
                new ProtectMachineOnlyPredicatesValidator(),
                new PermissionCheckingValidator(permissionsService),
                new ShaclValidator());

        Consumer<MetadataEvent.Type> metadataEventConsumer = type ->
                eventService.emitEvent(MetadataEvent.builder()
                        .category(EventCategory.METADATA)
                        .eventType(type)
                        .build()
                );

        metadataService = new ChangeableMetadataService(dataset, defaultGraphIRI, VOCABULARY_GRAPH_URI, config.jena.maxTriplesToReturn, metadataLifeCycleManager, metadataValidator, metadataEventConsumer);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(),
                new ShaclValidator(),
                new SystemVocabularyProtectingValidator(),
                new MetadataAndVocabularyConsistencyValidator(dataset),
                new InverseForUsedPropertiesValidator(dataset)
        );

        var vocabularyLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, userService);

        Consumer<MetadataEvent.Type> vocabularyEventConsumer = type ->
                eventService.emitEvent(MetadataEvent.builder()
                        .category(EventCategory.VOCABULARY)
                        .eventType(type)
                        .build()
                );

        userVocabularyService = new ChangeableMetadataService(dataset, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, 0, vocabularyLifeCycleManager, vocabularyValidator, vocabularyEventConsumer);
        metaVocabularyService = new ReadableMetadataService(dataset, META_VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);

        blobStore =  new LocalBlobStore(new File(config.webDAV.blobStorePath));
        fileSystem = new CompoundFileSystem(collectionsService, Map.of(
                ManagedFileSystem.TYPE, new ManagedFileSystem(dataset, blobStore, userService::getCurrentUserIri, collectionsService, eventBus),
                IRODSVirtualFileSystem.TYPE, new IRODSVirtualFileSystem(dataset, collectionsService)));
    }

    private EventService setupEventService() throws Exception {
        if(config.rabbitMQ.enabled) {
            try {
                var eventService = new RabbitMQEventService(config.rabbitMQ, config.workspace.name, () -> getThreadContext().getUserInfo());
                eventService.init();
                return eventService;
            } catch(Exception e) {
                log.error("Error connecting to RabbitMQ", e);

                if(config.rabbitMQ.required) {
                    throw e;
                }

                log.warn("Continuing without event functionality");
            }
        } else {
            log.warn("Logging to rabbitMQ is disabled due to configuration settings. Set rabbitMQ.enabled to true to enable logging");
        }

        return event -> log.trace("Logging events is disabled in configuration. Set rabbitMQ.enabled to true");
    }
}
