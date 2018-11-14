package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.KeycloakUser;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.events.PermissionAddedEvent;
import io.fairspace.neptune.model.events.User;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.io.IOException;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class RabbitMqEventsServiceTest {
    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private AuthorizationContainer authorizationContainer;

    @Mock
    private Exchange collectionsExchange;

    @Mock
    private UsersService usersService;

    RabbitMqEventsService service;

    Collection collection = Collection.builder().id(7L).name("my-collection").build();
    Permission permission = new Permission(3L, "receiver-subject", collection, Access.Write);
    User user;

    @Before
    public void setUp() throws Exception {
        when(authorizationContainer.getSubject()).thenReturn("test-subject");
        when(authorizationContainer.getFullname()).thenReturn("test-fullname");
        when(authorizationContainer.getUsername()).thenReturn("test-username");
        when(collectionsExchange.getName()).thenReturn("exchange-name");

        user = new User("test-subject", "test-username", "test-fullname", "test-email");
        service = new RabbitMqEventsService(rabbitTemplate, authorizationContainer, usersService, collectionsExchange);
    }

    @Test
    public void testExchangeName() {
        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                any(PermissionAddedEvent.class));
    }

    @Test
    public void testUserProperties() {
        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                argThat((PermissionAddedEvent argument) ->
                    argument.getUser().getId().equals("test-subject") &&
                            argument.getUser().getDisplayName().equals("test-fullname") &&
                            argument.getUser().getUsername().equals("test-username")
                )
        );
    }


    @Test
    public void testSubjectProperties() throws IOException {
        KeycloakUser subject = new KeycloakUser("subject-id", "subject", "John", "Snow", "john@snow.com");
        when(usersService.getUserById("receiver-subject")).thenReturn(Optional.of(subject));

        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                argThat((PermissionAddedEvent argument) ->
                        argument.getSubject().getId().equals("subject-id") &&
                                argument.getSubject().getDisplayName().equals("John Snow") &&
                                argument.getSubject().getEmail().equals("john@snow.com")
                )
        );
    }

    @Test
    public void testMessageWithoutSubject() throws IOException {
        when(usersService.getUserById("receiver-subject")).thenReturn(Optional.empty());

        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                argThat((PermissionAddedEvent argument) -> argument.getSubject() == null)
        );
    }

    @Test
    public void testMessageWithExceptionWhileRetrievingSubject() throws IOException {
        when(usersService.getUserById("receiver-subject")).thenThrow(new IOException("test"));

        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                argThat((PermissionAddedEvent argument) -> argument.getSubject() == null)
        );
    }


    @Test
    public void testCollectionId() {
        service.permissionAdded(permission, true);

        verify(rabbitTemplate).convertAndSend(
                eq("exchange-name"),
                anyString(),
                argThat((PermissionAddedEvent argument) ->
                    argument.getPermission().getCollection() == 7L &&
                            argument.getCollection().getId() == 7L
                )
        );
    }

}
