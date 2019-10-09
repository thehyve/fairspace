package io.fairspace.saturn.services.mail;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.MimeMessage;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MailServiceTest {
    @Mock
    Session session;

    @Mock
    Transport transport;

    @Mock
    MimeMessage message;

    MailService mailService;

    @Before
    public void setUp() throws Exception {
        mailService = new MailService(session);
        when(session.getTransport()).thenReturn(transport);
    }

    @Test
    public void send() throws MessagingException, ExecutionException, InterruptedException {
        assertTrue(mailService.send(message).get());
        verify(message).saveChanges();
        verify(transport).sendMessage(eq(message), any());
        verify(transport).close();
    }

    @Test
    public void exceptionHandling() throws MessagingException, ExecutionException, InterruptedException {
        doThrow(MessagingException.class).when(transport).sendMessage(any(), any());
        assertFalse(mailService.send(message).get());
        verify(transport).close();
    }

}
