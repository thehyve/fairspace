package io.fairspace.ceres.events.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component

@Configuration
@ConfigurationProperties(prefix="app.rabbitmq")
class RabbitMqProperties {
    var enabled = true
    var topology = RabbitMqTopology()

    data class RabbitMqTopology(var storage: RabbitMqStorageTopology = RabbitMqStorageTopology())
    data class RabbitMqStorageTopology(
            var exchange: String = "storage",
            var queues: Map<String, String> = emptyMap()
    )
}


