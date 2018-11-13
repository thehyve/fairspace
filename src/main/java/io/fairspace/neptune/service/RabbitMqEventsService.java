package io.fairspace.neptune.service;

import io.fairspace.neptune.config.RabbitMqConfig;
import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.events.CollectionAddedEvent;
import io.fairspace.neptune.model.events.CollectionDeletedEvent;
import io.fairspace.neptune.model.events.CollectionModifiedEvent;
import io.fairspace.neptune.model.events.PermissionAddedEvent;
import io.fairspace.neptune.model.events.PermissionDeletedEvent;
import io.fairspace.neptune.model.events.PermissionModifiedEvent;
import io.fairspace.neptune.model.events.User;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty("app.rabbitmq.enabled")
public class RabbitMqEventsService implements EventsService {
    private RabbitTemplate rabbitTemplate;
    private AuthorizationContainer authorizationContainer;
    private Exchange collectionsExchange;

    public RabbitMqEventsService(RabbitTemplate rabbitTemplate, AuthorizationContainer authorizationContainer, Exchange collectionsExchange) {
        this.rabbitTemplate = rabbitTemplate;
        this.authorizationContainer = authorizationContainer;
        this.collectionsExchange = collectionsExchange;
    }

    public void permissionAdded(Permission permission, boolean permissionForNewCollection) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.ADD_PERMISSION.getValue(),
                new PermissionAddedEvent(
                    getCurrentUser(),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection(),
                        permissionForNewCollection
                )
        );
    }

    public void permissionModified(Permission permission, Access oldAccess) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.MODIFY_PERMISSION.getValue(),
                new PermissionModifiedEvent(
                    getCurrentUser(),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection(),
                    oldAccess
                )
        );
    }

    public void permissionDeleted(Permission permission) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.DELETE_PERMISSION.getValue(),
                new PermissionDeletedEvent(
                    getCurrentUser(),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection()
                )
        );
    }

    public void collectionAdded(Collection collection) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.ADD_COLLECTION.getValue(),
                new CollectionAddedEvent(
                        getCurrentUser(),
                        collection
                )
        );
    }

    public void collectionModified(Collection collection, Collection oldCollection) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.MODIFY_COLLECTION.getValue(),
                new CollectionModifiedEvent(
                        getCurrentUser(),
                        collection,
                        oldCollection
                )
        );
    }

    public void collectionDeleted(Collection collection) {
        rabbitTemplate.convertAndSend(
                collectionsExchange.getName(),
                RabbitMqConfig.RoutingKeys.DELETE_COLLECTION.getValue(),
                new CollectionDeletedEvent(
                        getCurrentUser(),
                        collection
                )
        );
    }

    private User getCurrentUser() {
        return new User(
                authorizationContainer.getSubject(),
                authorizationContainer.getUsername(),
                authorizationContainer.getFullname());
    }
}

