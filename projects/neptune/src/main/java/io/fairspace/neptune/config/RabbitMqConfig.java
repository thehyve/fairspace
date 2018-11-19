package io.fairspace.neptune.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty("app.rabbitmq.enabled")
public class RabbitMqConfig {
    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory){
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(producerJackson2MessageConverter());
        return rabbitTemplate;
    }

    @Bean
    Jackson2JsonMessageConverter producerJackson2MessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    TopicExchange collectionsExchange(RabbitMqProperties properties) {
        return new TopicExchange(properties.getTopology().getCollections().getExchange());
    }

    public enum RoutingKeys {
        ADD_PERMISSION("add.permission"),
        MODIFY_PERMISSION("modify.permission"),
        DELETE_PERMISSION("delete.permission"),

        ADD_COLLECTION("add.collection"),
        MODIFY_COLLECTION("modify.collection"),
        DELETE_COLLECTION("delete.collection");

        private String value;

        RoutingKeys(String v) {
            this.value = v;
        }

        public String getValue() {
            return value;
        }
    }
}
