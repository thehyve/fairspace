package io.fairspace.saturn.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.rabbitmq.client.*;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import lombok.NonNull;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

@Slf4j
public class RabbitMQEventService implements EventService {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String CONTENT_TYPE = "application/json";
    private static final String CONTENT_ENCODING = "UTF-8";

    @Setter
    private ConnectionFactory factory = new ConnectionFactory();

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
        factory.setHost(config.host);
        factory.setPort(config.port);
        factory.setUsername(config.username);
        factory.setPassword(config.password);
        factory.setVirtualHost(config.virtualHost);

        Connection connection = factory.newConnection();
        channel = connection.createChannel();

        channel.exchangeDeclare(config.exchangeName, BuiltinExchangeType.TOPIC);
        log.info("Connected to RabbitMQ on {}:{}. [virtualHost = {}, exchange = {}]", config.host, config.port, config.virtualHost, config.exchangeName);
    }

    public void emitEvent(@NonNull Event event) {
        if(channel == null) {
            log.warn("Not emitting event {} because channel is unavailable. Has the service been initialized?", event);
            return;
        }

        EventContainer eventContainer = new EventContainer(workspaceId, getCurrentUser(), event);
        var routingKey = String.format("%s.%s.%s", workspaceId, event.getCategory().name().toLowerCase(), event.getType());

        AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                .contentType(CONTENT_TYPE)
                .contentEncoding(CONTENT_ENCODING)
                .timestamp(new Date())
                .build();
        try {
            var bytes = objectMapper.writeValueAsString(eventContainer).getBytes(Charsets.UTF_8);
            channel.basicPublish(config.exchangeName, routingKey, properties, bytes);
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
