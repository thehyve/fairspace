package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.Update;
import org.apache.jena.update.UpdateFactory;

import java.io.*;

import static java.lang.Long.parseLong;
import static java.util.Collections.singletonList;

public class SparqlTransactionCodec implements TransactionCodec {
    private static final String TIMESTAMP_PREFIX = "# Timestamp: ";
    private static final String USER_NAME_PREFIX = "# User Name: ";
    private static final String USER_ID_PREFIX = "# User ID: ";
    private static final String COMMIT_MESSAGE_PREFIX = "# Commit Message: ";
    private static final String COMMITTED = "# Committed";
    private static final String ABORTED = "# Aborted";

    @Override
    public TransactionListener write(OutputStream out) throws IOException {
        return new TransactionListener() {
            OutputStreamWriter writer = new OutputStreamWriter(out);

            @Override
            public void onBegin(String commitMessage, String userId, String userName, long timestamp) throws IOException {
                writer.write(TIMESTAMP_PREFIX + timestamp + "\n");
                if (userName != null) {
                    writer.write(USER_NAME_PREFIX + userName + "\n");
                }
                if (userId != null) {
                    writer.write(USER_ID_PREFIX + userId + "\n");
                }
                if (commitMessage != null) {
                    writer.write(COMMIT_MESSAGE_PREFIX + commitMessage.replace('\n', ' ') + "\n");
                }
                writer.write('\n');
            }

            @Override
            public void onAdd(Node graph, Node subject, Node predicate, Node object) throws IOException {
                save(new UpdateDataInsert(toQuads(graph, subject, predicate, object)));
            }

            @Override
            public void onDelete(Node graph, Node subject, Node predicate, Node object) throws IOException {
                save(new UpdateDataDelete(toQuads(graph, subject, predicate, object)));
            }

            private void save(Update update) throws IOException {
                writer.append(update.toString().replace('\n', ' ')).append(";\n");
            }

            private QuadDataAcc toQuads(Node graph, Node subject, Node predicate, Node object) {
                return new QuadDataAcc(singletonList(new Quad(graph, subject, predicate, object)));
            }

            @Override
            public void onCommit() throws IOException {
                writer.append(COMMITTED).append('\n');
                writer.flush();
            }

            @Override
            public void onAbort() throws IOException {
                writer.append(ABORTED).append('\n');
                writer.flush();
            }
        };
    }

    @Override
    public void read(InputStream in, TransactionListener listener) throws IOException {
        var reader = new BufferedReader(new InputStreamReader(in));

        long timestamp = 0L;
        String userName = null;
        String userId = null;
        String commitMessage = null;

        String line;
        while ((line = reader.readLine()) != null) {
            if (line.startsWith(TIMESTAMP_PREFIX)) {
                timestamp = parseLong(line.substring(TIMESTAMP_PREFIX.length()));
            } else if (line.startsWith(USER_NAME_PREFIX)) {
                userName = line.substring(USER_NAME_PREFIX.length());
            } else if (line.startsWith(USER_ID_PREFIX)) {
                userId = line.substring(USER_ID_PREFIX.length());
            } else if (line.startsWith(COMMIT_MESSAGE_PREFIX)) {
                commitMessage = line.substring(COMMIT_MESSAGE_PREFIX.length());
            } else if (line.isBlank()) {
                listener.onBegin(commitMessage, userId, userName, timestamp);
            } else if (line.equals(COMMITTED)) {
                listener.onCommit();
            } else if (line.equals(ABORTED)) {
                listener.onAbort();
            } else {
                for (var update : UpdateFactory.create(line)) {
                    if (update instanceof UpdateDataDelete) {
                        for (var quad : ((UpdateDataDelete) update).getQuads()) {
                            listener.onDelete(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject());
                        }
                    } else if (update instanceof UpdateDataInsert) {
                        for (var quad : ((UpdateDataInsert) update).getQuads()) {
                            listener.onAdd(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject());
                        }
                    }
                }
            }
        }
    }
}
