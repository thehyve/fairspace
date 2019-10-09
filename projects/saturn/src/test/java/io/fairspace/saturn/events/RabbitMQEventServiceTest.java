package io.fairspace.saturn.events;

import com.rabbitmq.client.BuiltinExchangeType;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.apache.log4j.AppenderSkeleton;
import org.apache.log4j.Level;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class RabbitMQEventServiceTest {
    private Map<String, Object> claims = Map.of(
            SUBJECT_CLAIM, "test",
            FIRSTNAME_CLAIM, "first",
            LASTNAME_CLAIM, "last"
    );

    private OAuthAuthenticationToken token = new OAuthAuthenticationToken("accessToken", "refreshToken", claims);
    private Config.RabbitMQ config = Config.RabbitMQ.builder()
            .host("server")
            .username("username")
            .password("password")
            .build();


    @Mock
    private ConnectionFactory factory;
    @Mock
    private Connection connection;
    @Mock
    private Channel channel;
    @Mock
    AppenderSkeleton appender;
    @Mock
    Event event;

    private RabbitMQEventService service;

    @Before
    public void setUp() throws Exception {
        org.apache.log4j.Logger.getRootLogger().addAppender(appender);

        service = new RabbitMQEventService(config, "workspaceId", () -> token);
        service.setFactory(factory);

        when(factory.newConnection()).thenReturn(connection);
        when(connection.createChannel()).thenReturn(channel);

        when(event.toString()).thenReturn("-- serialized event --");
        when(event.getCategory()).thenReturn(EventCategory.COLLECTION);
    }

    @Test
    public void init() throws IOException, TimeoutException {
        service.init();

        verify(channel).exchangeDeclare(config.exchangeName, BuiltinExchangeType.TOPIC);
    }

    @Test
    public void testUnInitializedServiceWarnsWhenEmitting() {
        service.emitEvent(event);

        verify(appender).doAppend(argThat(argument -> argument.getMessage().toString().contains("-- serialized event --")));
    }

    @Test
    public void testEmittingEvent() throws IOException, TimeoutException {
        event = FileSystemEvent.builder()
                .path("/path")
                .eventType(FileSystemEvent.FileEventType.DELETED)
                .build();

        service.init();
        service.emitEvent(event);

        String expectedRoutingKey = "workspaceId.file_system.deleted";
        verify(channel).basicPublish(eq(config.exchangeName), eq(expectedRoutingKey), any(), any());
    }

    @Test
    public void testUnserializableEvent() throws IOException, TimeoutException {
        service.init();
        service.emitEvent(event);

        verify(appender).doAppend(argThat(argument -> argument.getLevel().equals(Level.ERROR) && argument.getMessage().toString().contains("-- serialized event --")));
    }

    @Test
    public void testExceptionHandling() throws IOException, TimeoutException {
        event = FileSystemEvent.builder()
                .path("/path")
                .eventType(FileSystemEvent.FileEventType.DELETED)
                .build();

        doThrow(IOException.class).when(channel).basicPublish(any(), any(), any(), any());

        service.init();
        service.emitEvent(event);

        verify(appender).doAppend(argThat(argument -> argument.getLevel().equals(Level.ERROR) && argument.getMessage().toString().contains("FileSystemEvent")));
    }


}
