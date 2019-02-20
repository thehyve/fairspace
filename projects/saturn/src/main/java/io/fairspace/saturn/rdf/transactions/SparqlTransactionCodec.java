package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.Update;
import org.apache.jena.update.UpdateFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.OutputStreamWriter;

import static java.lang.Long.parseLong;
import static java.util.Collections.singletonList;

public class SparqlTransactionCodec implements TransactionListener {
    private static final String TIMESTAMP_PREFIX = "# Timestamp: ";
    private static final String USER_NAME_PREFIX = "# User Name: ";
    private static final String USER_ID_PREFIX = "# User ID: ";
    private static final String COMMIT_MESSAGE_PREFIX = "# Commit Message: ";
    private static final String COMMITTED = "# Committed";
    private static final String ABORTED = "# Aborted";

    private final OutputStreamWriter writer;

    public SparqlTransactionCodec(OutputStreamWriter writer) {
        this.writer = writer;
    }

    @Override
    public void onBegin(String commitMessage, String userId, String userName, long timestamp) {
        try {
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
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onAdd(Node graph, Node subject, Node predicate, Node object) {
        save(new UpdateDataInsert(toQuads(graph, subject, predicate, object)));
    }

    @Override
    public void onDelete(Node graph, Node subject, Node predicate, Node object) {
        save(new UpdateDataDelete(toQuads(graph, subject, predicate, object)));
    }

    private void save(Update update) {
        try {
            writer.append(update.toString().replace('\n', ' ')).append(";\n");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static QuadDataAcc toQuads(Node graph, Node subject, Node predicate, Node object) {
        return new QuadDataAcc(singletonList(new Quad(graph, subject, predicate, object)));
    }

    @Override
    public void onCommit() {
        try {
            writer.append(COMMITTED).append('\n');
            writer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onAbort() {
        try {
            writer.append(ABORTED).append('\n');
            writer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void read(BufferedReader reader, TransactionListener listener) {
        long timestamp = 0L;
        String userName = null;
        String userId = null;
        String commitMessage = null;

        try (reader) {
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
                    UpdateFactory.create(line).forEach(update -> {
                        if (update instanceof UpdateDataDelete) {
                            ((UpdateDataDelete) update).getQuads().forEach(quad ->
                                    listener.onDelete(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject()));
                        } else if (update instanceof UpdateDataInsert) {
                            ((UpdateDataInsert) update).getQuads().forEach(quad ->
                                    listener.onAdd(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject()));
                        }
                    });
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
