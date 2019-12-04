package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.seaborne.patch.RDFChanges;
import org.seaborne.patch.changes.RDFChangesBase;
import org.seaborne.patch.changes.RDFChangesWriter;
import org.seaborne.patch.text.RDFPatchReaderText;
import org.seaborne.patch.text.TokenWriterText;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.Instant;

import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;

public class RDFPatchTransactionCodec implements TransactionCodec {
    private static final String USER_COMMIT_MESSAGE_FIELD = "userCommitMessage";
    private static final String SYSTEM_COMMIT_MESSAGE_FIELD = "systemCommitMessage";
    private static final String USER_ID_FIELD = "userId";
    private static final String USER_NAME_FIELD = "userName";
    private static final String TIMESTAMP_FIELD = "timestamp";

    @Override
    public TransactionListener write(OutputStream out) throws IOException {
        // Prevents unnecessary flushes by RDFChangesWriter
        var nonFlushingOutputStream = new FilterOutputStream(out) {
            @Override
            public void flush() {
            }
        };

        return new TransactionListener() {
            private final RDFChanges changes = new RDFChangesWriter(new TokenWriterText(nonFlushingOutputStream));
            private boolean first = true;

            @Override
            public void onMetadata(String userCommitMessage, String systemCommitMessage, String userId, String userName, long timestamp) {
                if (first) {
                    first = false;
                } else {
                    changes.txnCommit();
                }

                if (userCommitMessage != null) {
                    changes.header(USER_COMMIT_MESSAGE_FIELD, createStringLiteral(userCommitMessage).asNode());
                }
                if (systemCommitMessage != null) {
                    changes.header(SYSTEM_COMMIT_MESSAGE_FIELD, createStringLiteral(systemCommitMessage).asNode());
                }
                if (userId != null) {
                    changes.header(USER_ID_FIELD, createStringLiteral(userId).asNode());
                }
                if (userName != null) {
                    changes.header(USER_NAME_FIELD, createStringLiteral(userName).asNode());
                }
                changes.header(TIMESTAMP_FIELD, toXSDDateTimeLiteral(Instant.ofEpochMilli(timestamp)).asNode());

                changes.txnBegin();
            }

            @Override
            public void onAdd(Node graph, Node subject, Node predicate, Node object) {
                changes.add(graph, subject, predicate, object);
            }

            @Override
            public void onDelete(Node graph, Node subject, Node predicate, Node object) {
                changes.delete(graph, subject, predicate, object);
            }

            @Override
            public void onCommit() {
                changes.txnCommit();
            }

            @Override
            public void onAbort() {
                changes.txnAbort();
            }
        };
    }

    @Override
    public void read(InputStream in, TransactionListener listener) {
        listener.onBegin();

        var reader = new RDFPatchReaderText(in);

        reader.apply(new RDFChangesBase() {
            private String userCommitMessage;
            private String systemCommitMessage;
            private String userId;
            private String userName;
            private long timestamp;

            @Override
            public void header(String field, Node value) {
                switch (field) {
                    case USER_COMMIT_MESSAGE_FIELD:
                        userCommitMessage = value.getLiteral().toString(false);
                        break;
                    case SYSTEM_COMMIT_MESSAGE_FIELD:
                        systemCommitMessage = value.getLiteral().toString(false);
                        break;
                    case USER_ID_FIELD:
                        userId = value.getLiteral().toString(false);
                        break;
                    case USER_NAME_FIELD:
                        userName = value.getLiteral().toString(false);
                        break;
                    case TIMESTAMP_FIELD:
                        timestamp = ((XSDDateTime) value.getLiteralValue()).asCalendar().getTimeInMillis();
                        break;
                }
            }

            @Override
            public void add(Node g, Node s, Node p, Node o) {
                listener.onAdd(g, s, p, o);
            }

            @Override
            public void delete(Node g, Node s, Node p, Node o) {
                listener.onDelete(g, s, p, o);
            }

            @Override
            public void addPrefix(Node gn, String prefix, String uriStr) {
                throw new UnsupportedOperationException("addPrefix");
            }

            @Override
            public void deletePrefix(Node gn, String prefix) {
                throw new UnsupportedOperationException("deletePrefix");
            }

            @Override
            public void txnBegin() {
                listener.onMetadata(userCommitMessage, systemCommitMessage, userId, userName, timestamp);

                timestamp = 0L;
                userName = null;
                userId = null;
                userCommitMessage = null;
                systemCommitMessage = null;
            }
        });

        listener.onCommit();
    }
}
