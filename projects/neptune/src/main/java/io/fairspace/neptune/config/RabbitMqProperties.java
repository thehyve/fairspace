package io.fairspace.neptune.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix="app.rabbitmq")
@Data
public class RabbitMqProperties {
    private boolean enabled = true;
    private RabbitMqTopology topology;

    @Data
    static class RabbitMqTopology {
        private RabbitMqCollectionsTopology collections;
    }

    @Data
    static class RabbitMqCollectionsTopology {
        private String exchange;
    }
}


