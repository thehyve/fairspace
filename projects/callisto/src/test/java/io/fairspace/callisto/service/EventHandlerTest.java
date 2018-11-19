package io.fairspace.callisto.service;

import io.fairspace.callisto.model.PermissionEvent;
import io.fairspace.callisto.model.User;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class EventHandlerTest {
    @Mock
    private EmailService emailService;

    private EventHandler eventHandler;

    @Before
    public void setUp() throws Exception {
        eventHandler = new EventHandler(emailService);
    }

    @Test
    public void testNewPermissionMessage() {
        User subject = new User("subject", "subject-name", "display-name", "john@test.com");
        PermissionEvent event = new PermissionEvent(null, subject, null, null, false);
        eventHandler.receiveAddPermissionMessage(event);

        verify(emailService).sendNotification("john@test.com", event);
    }

    @Test
    public void testNoMessageForNewCollection() {
        User subject = new User("subject", "subject-name", "display-name", "john@test.com");
        eventHandler.receiveAddPermissionMessage(new PermissionEvent(null, subject, null, null, true));
        verify(emailService, times(0)).sendNotification(any(), any());
    }

    @Test
    public void testNoMessageWithoutEmailAddress() {
        User subjectNoEmail = new User("subject", "subject-name", "display-name", null);
        User subjectEmptyEmail = new User("subject", "subject-name", "display-name", "");

        eventHandler.receiveAddPermissionMessage(new PermissionEvent(null, null, null, null, false));
        eventHandler.receiveAddPermissionMessage(new PermissionEvent(null, subjectEmptyEmail, null, null, false));
        eventHandler.receiveAddPermissionMessage(new PermissionEvent(null, subjectNoEmail, null, null, false));

        verify(emailService, times(0)).sendNotification(any(), any());
    }


}
