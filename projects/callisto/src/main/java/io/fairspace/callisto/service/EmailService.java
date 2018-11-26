package io.fairspace.callisto.service;

import io.fairspace.callisto.config.MailProperties;
import io.fairspace.callisto.model.PermissionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
    private JavaMailSender emailSender;
    private MailProperties properties;

    public EmailService(
            JavaMailSender emailSender,
            MailProperties properties
    ) {
        this.emailSender = emailSender;
        this.properties = properties;
    }

    public void sendNotification(String email, PermissionEvent event) {
        log.debug("Sending notification email about new permission to: {}", email);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.getFrom());
        message.setTo(email);
        message.setSubject("Someone shared a collection with you");
        message.setText(event.getUser().getDisplayName() + " shared collection " + event.getCollection().getName() + " with you. You have " + event.getPermission().getAccess() + " rights.");
        try {
            emailSender.send(message);
        } catch (MailException e) {
            log.error("Error sending an email", e);
        }

    }
}
