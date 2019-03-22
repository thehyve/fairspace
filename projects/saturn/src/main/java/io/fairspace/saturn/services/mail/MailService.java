package io.fairspace.saturn.services.mail;

import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


public class MailService {
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Session session;

    public MailService(Properties properties) {
        session = Session.getInstance(properties);
    }

    public MimeMessage newMessage() {
        return new MimeMessage(session);
    }

    public Future<Boolean> send(MimeMessage message) {
        return executorService.submit(() -> {
                Transport.send(message);
                return true;
        });
    }
}
