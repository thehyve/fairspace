package io.fairspace.saturn.services.mail;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.users.User;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDFS;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.util.ArrayList;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.net.URLEncoder.encode;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;


public class MailComposer {
    private final MailService mailService;
    private final RDFConnection rdf;
    private final DAO dao;

    public MailComposer(MailService mailService, RDFConnection rdf) {
        this.mailService = mailService;
        this.rdf = rdf;
        dao = new DAO(rdf, null);
    }

    public MessageBuilder newMessage(String subject) {
        return new MessageBuilder(subject);
    }

    private String getLabel(Node node) {
        var stmts = rdf.queryConstruct(storedQuery("select_by_mask", defaultGraphIRI, node, RDFS.label)).listStatements();
        return stmts.hasNext() ? node.getURI() : stmts.nextStatement().getString();
    }

    public class MessageBuilder {
        private final String subject;
        private final StringBuilder body = new StringBuilder();

        private MessageBuilder(String subject) {
            this.subject = subject;
        }

        public MessageBuilder append(Object o) {
            body.append(o);
            return this;
        }

        public MessageBuilder appendLink(Node node) {
            return appendLink(node.getURI(), getLabel(node));
        }

        public MessageBuilder appendLink(String url, String text) {
            body.append("<a href=\"").append(encode(url, UTF_8)).append("\">").append(text).append("</a>");
            return this;
        }

        public void send(Address... recipients) {
            try {
                var msg = mailService.newMessage();
                msg.setSubject(subject);
                msg.setContent(body.toString(), "text/html");
                msg.setRecipients(Message.RecipientType.TO, recipients);
                mailService.send(msg);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }

        public void send(Node... recipients) {
            send(getAddresses(recipients));
        }

        private Address[] getAddresses(Node[] recipients) {
            var list = new ArrayList<Address>();
            for (var iri : recipients) {
                var user = dao.read(User.class, iri);
                if (user != null && user.getEmail() != null) {
                    try {
                        list.add(new InternetAddress(user.getEmail()));
                    } catch (AddressException ignore) {
                    }
                }
            }
            return list.toArray(new Address[0]);
        }
    }
}
