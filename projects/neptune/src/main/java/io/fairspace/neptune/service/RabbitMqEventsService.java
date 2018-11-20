package io.fairspace.neptune.service;

import io.fairspace.neptune.config.RabbitMqConfig;
import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.events.CollectionAddedEvent;
import io.fairspace.neptune.model.events.CollectionDeletedEvent;
import io.fairspace.neptune.model.events.CollectionModifiedEvent;
import io.fairspace.neptune.model.events.NeptuneEvent;
import io.fairspace.neptune.model.events.PermissionAddedEvent;
import io.fairspace.neptune.model.events.PermissionDeletedEvent;
import io.fairspace.neptune.model.events.PermissionModifiedEvent;
import io.fairspace.neptune.model.events.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@ConditionalOnProperty("app.rabbitmq.enabled")
@Slf4j
public class RabbitMqEventsService implements EventsService {
    private RabbitTemplate rabbitTemplate;
    private AuthorizationContainer authorizationContainer;
    private UsersService usersService;
    private Exchange collectionsExchange;

    public RabbitMqEventsService(RabbitTemplate rabbitTemplate, AuthorizationContainer authorizationContainer, UsersService usersService, Exchange collectionsExchange) {
        this.rabbitTemplate = rabbitTemplate;
        this.authorizationContainer = authorizationContainer;
        this.usersService = usersService;
        this.collectionsExchange = collectionsExchange;
    }

    public void permissionAdded(Permission permission, boolean permissionForNewCollection) {
        send(
                RabbitMqConfig.RoutingKeys.ADD_PERMISSION.getValue(),
                new PermissionAddedEvent(
                    getCurrentUser(),
                    getSubject(permission),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection(),
                    permissionForNewCollection
                )
        );
    }

    public void permissionModified(Permission permission, Access oldAccess) {
        send(
                RabbitMqConfig.RoutingKeys.MODIFY_PERMISSION.getValue(),
                new PermissionModifiedEvent(
                    getCurrentUser(),
                    getSubject(permission),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection(),
                    oldAccess
                )
        );
    }

    public void permissionDeleted(Permission permission) {
        send(
                RabbitMqConfig.RoutingKeys.DELETE_PERMISSION.getValue(),
                new PermissionDeletedEvent(
                    getCurrentUser(),
                    getSubject(permission),
                    io.fairspace.neptune.model.dto.Permission.fromModel(permission),
                    permission.getCollection()
                )
        );
    }

    public void collectionAdded(Collection collection) {
        send(
                RabbitMqConfig.RoutingKeys.ADD_COLLECTION.getValue(),
                new CollectionAddedEvent(
                        getCurrentUser(),
                        collection
                )
        );
    }

    public void collectionModified(Collection collection, Collection oldCollection) {
        send(
                RabbitMqConfig.RoutingKeys.MODIFY_COLLECTION.getValue(),
                new CollectionModifiedEvent(
                        getCurrentUser(),
                        collection,
                        oldCollection
                )
        );
    }

    public void collectionDeleted(Collection collection) {
        send(
                RabbitMqConfig.RoutingKeys.DELETE_COLLECTION.getValue(),
                new CollectionDeletedEvent(
                        getCurrentUser(),
                        collection
                )
        );
    }

    @Async
    void send(String routingKey, NeptuneEvent event) {
        rabbitTemplate.convertAndSend(collectionsExchange.getName(), routingKey, event);
    }

    private User getCurrentUser() {
        return new User(
                authorizationContainer.getSubject(),
                authorizationContainer.getUsername(),
                authorizationContainer.getFullname(),
                authorizationContainer.getEmail());
    }

    private User getSubject(Permission permission) {
        try {
            return usersService.getUserById(permission.getSubject())
                    .map(keycloakUser -> new User(
                            keycloakUser.getId(),
                            keycloakUser.getUsername(),
                            keycloakUser.getFullname(),
                            keycloakUser.getEmail()
                    )).orElse(null);
        } catch (IOException e) {
            return null;
        }
    }
}

