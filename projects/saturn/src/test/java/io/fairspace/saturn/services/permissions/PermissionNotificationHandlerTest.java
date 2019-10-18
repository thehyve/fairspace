package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.transactions.RDFLinkSimple;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionNotificationHandlerTest {
    private static final Node RESOURCE = createURI("http://example.com/resource");
    private static final Node USER1 = createURI("http://example.com/user1");
    private static final Node USER2 = createURI("http://example.com/user2");
    private static final Node COLLECTION_1 = createURI("http://example.com/collection1");

    private Dataset ds;
    private PermissionNotificationHandler permissionNotificationHandler;

    @Mock
    private UserService userService;

    @Mock
    private MimeMessage message;

    @Mock
    private MailService mailService;

    private Node currentUser = USER1;

    @Before
    public void setUp() {
        when(userService.getUser(any())).thenAnswer(invocation -> new User() {{
            setIri(invocation.getArgument(0));
            setName("John");
            setEmail("user@example.com");
        }});
        when(mailService.newMessage()).thenReturn(message);

        ds = DatasetFactory.create();
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDFS.label, "LABEL");
        ds.getDefaultModel().add(createResource(COLLECTION_1.getURI()), RDF.type, FS.Collection);
        ds.getDefaultModel().add(createResource(COLLECTION_1.getURI()), RDFS.label, "COLLECTION");
        ds.getDefaultModel().add(createResource(COLLECTION_1.getURI()), FS.filePath, "location");

        permissionNotificationHandler = new PermissionNotificationHandler(new RDFLinkSimple(ds), userService, mailService, "http://public-url");
    }

    @Test
    public void testEmailForResource() throws MessagingException {
        permissionNotificationHandler.onPermissionChange(currentUser, RESOURCE, USER2, Access.Write);
        verify(mailService).newMessage();
        verify(message).setText("Your access level for resource LABEL (http://example.com/resource) was set to Write by John.");
        verify(message).setRecipient(Message.RecipientType.TO, new InternetAddress("user@example.com"));
        verify(mailService).send(any());
    }

    @Test
    public void testEmailForCollection() throws MessagingException {
        permissionNotificationHandler.onPermissionChange(currentUser, COLLECTION_1, USER2, Access.Write);

        verify(mailService).newMessage();
        verify(message).setText("Your access level for collection COLLECTION (http://public-url/collections/location) was set to Write by John.");
        verify(message).setRecipient(Message.RecipientType.TO, new InternetAddress("user@example.com"));
        verify(mailService).send(any());
    }

    @Test
    public void testNotificationWithoutEmailAddress() {
        when(userService.getUser(any())).thenAnswer(invocation -> new User() {{
            setIri(invocation.getArgument(0));
            setName("John");
        }});

        permissionNotificationHandler.onPermissionChange(currentUser, COLLECTION_1, USER2, Access.Write);
        verifyZeroInteractions(mailService);
    }
}
