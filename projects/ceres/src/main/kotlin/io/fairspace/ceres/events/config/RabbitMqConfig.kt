package io.fairspace.ceres.events.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.TopicExchange
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty("app.rabbitmq.enabled")
class RabbitMqConfig(val properties: RabbitMqProperties) {
    @Bean
    fun storageExchange(): TopicExchange {
        return TopicExchange(properties.topology.storage.exchange)
    }

    @Bean
    fun storageCreateQueue(): Queue {
        return Queue(properties.topology.storage.queues["create"], true)
    }

    @Bean
    fun storageMoveQueue(): Queue {
        return Queue(properties.topology.storage.queues["move"], true)
    }

    @Bean
    fun storageCopyQueue(): Queue {
        return Queue(properties.topology.storage.queues["copy"], true)
    }

    @Bean
    fun storageDeleteQueue(): Queue {
        return Queue(properties.topology.storage.queues["delete"], true)
    }

    @Bean
    fun storageUploadBinding(storageCreateQueue: Queue, storageExchange: TopicExchange): Binding {
        return BindingBuilder.bind(storageCreateQueue).to(storageExchange).with(RoutingKeys.UPLOAD)
    }

    @Bean
    fun storageMkDirBinding(storageCreateQueue: Queue, storageExchange: TopicExchange): Binding {
        return BindingBuilder.bind(storageCreateQueue).to(storageExchange).with(RoutingKeys.MKDIR)
    }

    @Bean
    fun storageMoveBinding(storageMoveQueue: Queue, storageExchange: TopicExchange): Binding {
        return BindingBuilder.bind(storageMoveQueue).to(storageExchange).with(RoutingKeys.MOVE)
    }

    @Bean
    fun storageCopyBinding(storageCopyQueue: Queue, storageExchange: TopicExchange): Binding {
        return BindingBuilder.bind(storageCopyQueue).to(storageExchange).with(RoutingKeys.COPY)
    }

    @Bean
    fun storageDeleteBinding(storageDeleteQueue: Queue, storageExchange: TopicExchange): Binding {
        return BindingBuilder.bind(storageDeleteQueue).to(storageExchange).with(RoutingKeys.DELETE)
    }


    @Bean
    fun rabbitTemplate(connectionFactory: ConnectionFactory): RabbitTemplate {
        val rabbitTemplate = RabbitTemplate(connectionFactory)
        rabbitTemplate.messageConverter = producerJackson2MessageConverter()
        return rabbitTemplate
    }

    @Bean
    fun producerJackson2MessageConverter(): Jackson2JsonMessageConverter {
        return Jackson2JsonMessageConverter()
    }


    enum class RoutingKeys(val key: String) {
        READ("read"),
        DOWNLOAD("download"),
        UPLOAD("upload"),
        MKDIR("mkdir"),
        COPY("copy"),
        MOVE("move"),
        DELETE("delete");

        override fun toString(): String {
            return key
        }
    }
}
