package io.fairspace.callisto.service;

import io.fairspace.callisto.model.PermissionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Slf4j
public class EventHandler {
    private EmailService emailService;

    public EventHandler(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = "${app.rabbitmq.topology.collections.queues.addPermission}")
    void receiveAddPermissionMessage(PermissionEvent event) {
        if (event.isPermissionForNewCollection()) {
            // Do not send e-mails when creating a new collection
            log.trace("Received event for permission creation for new collection");
            return;
        }

        if (event.getSubject() == null || StringUtils.isEmpty(event.getSubject().getEmail())) {
            // Do not send e-mails if we do not have the email address
            log.debug("Event for permission creation received, but no subject email was given");
            return;
        }

        emailService.sendNotification(event.getSubject().getEmail(), event);
    }
}
