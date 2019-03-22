package io.fairspace.saturn.services.mail;

import lombok.extern.slf4j.Slf4j;

import javax.mail.Session;
import javax.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Slf4j
public class MailService {
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Session session;

    public MailService(Properties properties) {
        this.session = Session.getInstance(properties);
    }

    public MimeMessage newMessage() {
        return new MimeMessage(session);
    }

    public Future<Boolean> send(MimeMessage message) {
        return executorService.submit(() -> {
            try {
                message.saveChanges();
                var transport = session.getTransport();
                try {
                    transport.connect(session.getProperty("mail.user"), session.getProperty("mail.password"));
                    transport.sendMessage(message, message.getAllRecipients());
                } finally {
                    transport.close();
                }
                return true;
            } catch (Exception e) {
                log.error("Error sending an email to {}", message.getAllRecipients(), e);
                return false;
            }
        });
    }
}
