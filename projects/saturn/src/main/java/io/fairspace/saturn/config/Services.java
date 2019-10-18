package io.fairspace.saturn.config;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.events.EventCategory;
import io.fairspace.saturn.events.EventService;
import io.fairspace.saturn.events.MetadataEvent;
import io.fairspace.saturn.events.RabbitMQEventService;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.RDFLink;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.ChangeableMetadataService;
import io.fairspace.saturn.services.metadata.MetadataEntityLifeCycleManager;
import io.fairspace.saturn.services.metadata.ReadableMetadataService;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.permissions.PermissionNotificationHandler;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.permissions.PermissionsServiceImpl;
import io.fairspace.saturn.services.users.UserService;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;

import java.util.function.BooleanSupplier;
import java.util.function.Consumer;
import java.util.function.Supplier;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
@Getter
public class Services {
    private final Config config;
    private final RDFLink rdfLink;

    private final EventBus eventBus = new EventBus();
    private final UserService userService;
    private final EventService eventService;
    private final MailService mailService;
    private final PermissionsService permissionsService;
    private final CollectionsService collectionsService;
    private final ChangeableMetadataService metadataService;
    private final ChangeableMetadataService userVocabularyService;
    private final ReadableMetadataService metaVocabularyService;


    public Services(@NonNull Config config, @NonNull RDFLink rdfLink) throws Exception {
        this.config = config;
        this.rdfLink = rdfLink;

        userService = new UserService(new DAO(rdfLink, null), config.auth.userUrlTemplate);
        Supplier<Node> userIriSupplier = () -> userService.getUserIri(getThreadContext().getUserInfo().getSubjectClaim());
        BooleanSupplier hasFullAccessSupplier = () -> getThreadContext().getUserInfo().getAuthorities().contains(config.auth.fullAccessRole);

        eventService = setupEventService();

        mailService = new MailService(config.mail);
        var permissionNotificationHandler = new PermissionNotificationHandler(rdfLink, userService, mailService, config.publicUrl);
        permissionsService = new PermissionsServiceImpl(rdfLink, userIriSupplier, hasFullAccessSupplier, permissionNotificationHandler, eventService);

        collectionsService = new CollectionsService(rdfLink, new DAO(rdfLink, userIriSupplier), eventBus::post, permissionsService, eventService);

        var metadataLifeCycleManager = new MetadataEntityLifeCycleManager(rdfLink, defaultGraphIRI, VOCABULARY_GRAPH_URI, userIriSupplier, permissionsService);

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

        metadataService = new ChangeableMetadataService(rdfLink, defaultGraphIRI, VOCABULARY_GRAPH_URI, config.jena.maxTriplesToReturn, metadataLifeCycleManager, metadataValidator, metadataEventConsumer);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(),
                new ShaclValidator(),
                new SystemVocabularyProtectingValidator(),
                new MetadataAndVocabularyConsistencyValidator(),
                new InverseForUsedPropertiesValidator()
        );

        var vocabularyLifeCycleManager = new MetadataEntityLifeCycleManager(rdfLink, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, userIriSupplier);

        Consumer<MetadataEvent.Type> vocabularyEventConsumer = type ->
                eventService.emitEvent(MetadataEvent.builder()
                        .category(EventCategory.VOCABULARY)
                        .eventType(type)
                        .build()
                );

        userVocabularyService = new ChangeableMetadataService(rdfLink, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, vocabularyLifeCycleManager, vocabularyValidator, vocabularyEventConsumer);
        metaVocabularyService = new ReadableMetadataService(rdfLink, META_VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);
    }

    private EventService setupEventService() throws Exception {
        if (config.rabbitMQ.enabled) {
            try {
                var eventService = new RabbitMQEventService(config.rabbitMQ, config.workspace.name);
                eventService.init();
                return eventService;
            } catch (Exception e) {
                log.error("Error connecting to RabbitMQ", e);

                if (config.rabbitMQ.required) {
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
