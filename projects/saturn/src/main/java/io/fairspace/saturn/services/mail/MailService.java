package io.fairspace.saturn.services.mail;

import com.google.common.util.concurrent.Futures;
import lombok.extern.slf4j.Slf4j;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

// TODO: Use me
@Slf4j
public class MailService {
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Session session;

    public MailService(Properties properties) {
        this(Session.getInstance(properties));
    }

    public MailService(Session session) {
        this.session = session;
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

    public Future<Boolean> send(String email, String subject, String text) {
        try {
            var msg = newMessage();
            msg.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
            msg.setSubject(subject);
            msg.setText(text);
            return send(msg);
        } catch (Exception e) {
            return Futures.immediateFailedFuture(e);
        }
    }
}
