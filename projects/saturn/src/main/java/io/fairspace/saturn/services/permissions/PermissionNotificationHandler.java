package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.mail.Message;
import javax.mail.internet.InternetAddress;

import static java.util.Optional.ofNullable;

/**
 * Sends an email to a user that gets access to a certain resource
 */
@AllArgsConstructor
@Slf4j
public class PermissionNotificationHandler implements PermissionChangeEventHandler {
    private final Transactions transactions;
    private final UserService userService;
    private final MailService mailService;
    private final String publicUrl;

    public void onPermissionChange(Node currentUser, Node node, Node user, Access access) {
        ofNullable(userService.getUser(user))
                .map(User::getEmail)
                .ifPresent(email -> {
                    try {
                        var msg = mailService.newMessage();
                        msg.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
                        msg.setSubject("Your access permissions changed");
                        msg.setText(transactions.calculateRead(dataset -> {
                                    var resource = dataset.getDefaultModel().asRDFNode(node).asResource();

                                    return "Your access level for " +
                                            (isCollection(resource)
                                                    ? "collection " + getLabel(resource) + " (" + getCollectionUrl(resource) + ")"
                                                    : "resource " + getLabel(resource) + " (" + resource.getURI() + ")") +
                                            " was set to " + access + " by " + userService.getUser(currentUser).getName() + ".";
                                }

                        ));

                        mailService.send(msg);
                    } catch (Exception e) {
                        log.error("Error sending an email", e);
                    }
                });
    }

    /**
     * Returns the public url where this collection can be accessed
     *
     * @param collection
     * @return
     */
    private String getCollectionUrl(Resource collection) {
        return String.format("%s/collections/%s", publicUrl, getLocation(collection));
    }

    private boolean isCollection(Resource resource) {
        return resource.hasProperty(RDF.type, FS.Collection);
    }

    private String getLabel(Resource resource) {
        return resource
                .listProperties(RDFS.label)
                .nextOptional()
                .map(Statement::getString)
                .orElse("");
    }

    private String getLocation(Resource collection) {
        return collection.getLocalName();
    }
}

