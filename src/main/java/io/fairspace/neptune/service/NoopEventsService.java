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
@ConditionalOnProperty(value = "app.rabbitmq.enabled", havingValue = "false")
public class NoopEventsService implements EventsService {
    public void permissionAdded(Permission permission, boolean permissionForNewCollection) {}
    public void permissionModified(Permission permission, Access oldAccess) {}
    public void permissionDeleted(Permission permission) {}

    public void collectionAdded(Collection collection) {}
    public void collectionModified(Collection collection, Collection oldCollection) {}
    public void collectionDeleted(Collection collection) {}
}

