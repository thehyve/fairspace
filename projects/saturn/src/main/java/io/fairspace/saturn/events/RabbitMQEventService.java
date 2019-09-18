package io.fairspace.saturn.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.Config;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

@Slf4j
public class RabbitMQEventService implements EventService {
    private final static AMQP.BasicProperties COMMON_PROPERTIES = new AMQP.BasicProperties.Builder().contentType("application/json").build();
    private final static ObjectMapper objectMapper = new ObjectMapper();

    private Config.RabbitMQ config;
    private String workspaceId;
    private Supplier<OAuthAuthenticationToken> tokenSupplier;
    private Channel channel;

    public RabbitMQEventService(Config.RabbitMQ config, String workspaceId, Supplier<OAuthAuthenticationToken> tokenSupplier) {
        this.config = config;
        this.workspaceId = workspaceId;
        this.tokenSupplier = tokenSupplier;
    }

    public void init() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(config.host);
        factory.setPort(config.port);
        factory.setUsername(config.username);
        factory.setPassword(config.password);
        factory.setVirtualHost(config.virtualHost);

        Connection connection = factory.newConnection();
        channel = connection.createChannel();

        channel.exchangeDeclare(config.exchangeName, "topic");
        log.info("Connected to RabbitMQ on {}:{}. [virtualHost = {}, exchange = {}]", config.host, config.port, config.virtualHost, config.exchangeName);
    }

    public void emitEvent(@NonNull Event event) {
        if(channel == null) {
            log.trace("Not emitting event {} because channel is unavailable", event);
        }

        event.setUser(getCurrentUser());
        event.setWorkspace(workspaceId);

        var routingKey = String.format("%s.%s.%s", event.getWorkspace(), event.getCategory(), event.getType());

        try {
            var bytes = objectMapper.writeValueAsString(event).getBytes();
            channel.basicPublish(config.exchangeName, routingKey, COMMON_PROPERTIES, bytes);
        } catch (JsonProcessingException e) {
            log.error("Error serializing event of type {} for message bus: {}", event.getClass().getSimpleName(), event.toString());
        } catch (IOException e) {
            log.error("Error emitting event of type {} for message bus: {}", event.getClass().getSimpleName(), event.toString());
        }
    }

    private User getCurrentUser() {
        OAuthAuthenticationToken token = tokenSupplier.get();

        if(token == null)
            return null;

        return new User(token.getSubjectClaim(), token.getUsername(), token.getFullName());
    }
}
