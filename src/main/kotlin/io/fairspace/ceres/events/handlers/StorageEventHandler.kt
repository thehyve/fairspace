package io.fairspace.ceres.events.handlers

import io.fairspace.ceres.events.model.StorageEvent
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.amqp.support.AmqpHeaders
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.messaging.handler.annotation.Header
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty("app.rabbitmq.enabled")
class StorageEventHandler {
    val log = LoggerFactory.getLogger(StorageEventHandler::class.java)

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.create}"])
    fun receiveCreateMessage(message: StorageEvent, @Header(AmqpHeaders.TYPE) type: String) {
        log.info("Create ({}) message received from RabbitMQ: {}", type, message)
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.move}"])
    fun receiveMoveMessage(message: StorageEvent) {
        log.info("Move message received from RabbitMQ: {}", message)
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.copy}"])
    fun receiveCopyMessage(message: StorageEvent) {
        log.info("Copy message received from RabbitMQ: {}", message)
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.delete}"])
    fun receiveDeleteMessage(message: StorageEvent) {
        log.info("Delete message received from RabbitMQ: {}", message)
    }

}
