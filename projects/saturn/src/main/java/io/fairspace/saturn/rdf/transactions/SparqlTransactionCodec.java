package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.UpdateFactory;

import java.io.*;
import java.util.HashSet;

public class SparqlTransactionCodec implements TransactionCodec {
    private static final String TIMESTAMP_PREFIX = "# Timestamp: ";
    private static final String USER_NAME_PREFIX = "# User Name: ";
    private static final String USER_ID_PREFIX = "# User ID: ";
    private static final String COMMIT_MESSAGE_PREFIX = "# Commit Message: ";

    @Override
    public void write(TransactionRecord transaction, OutputStream out) throws IOException {
        try (var writer = new OutputStreamWriter(out)) {
            writer.write(TIMESTAMP_PREFIX + transaction.getTimestamp() + "\n");
            if (transaction.getUserName() != null) {
                writer.write(USER_NAME_PREFIX + transaction.getUserName() + "\n");
            }
            if (transaction.getUserId() != null) {
                writer.write(USER_ID_PREFIX + transaction.getUserId() + "\n");
            }
            if (transaction.getCommitMessage() != null) {
                writer.write(COMMIT_MESSAGE_PREFIX + transaction.getCommitMessage().replace('\n', ' ') + "\n");
            }
            writer.write('\n');

            for (var update : transaction.asUpdateRequest().getOperations()) {
                writer.append(update.toString().replace('\n', ' ')).append(";\n");
            }
        }
    }

    @Override
    public TransactionRecord read(InputStream in) throws IOException {
        try {
            var transaction = new TransactionRecord();
            transaction.setDeleted(new HashSet<>());
            transaction.setAdded(new HashSet<>());

            try (var reader = new BufferedReader(new InputStreamReader(in))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith(TIMESTAMP_PREFIX)) {
                        transaction.setTimestamp(Long.parseLong(line.substring(TIMESTAMP_PREFIX.length())));
                    } else if (line.startsWith(USER_NAME_PREFIX)) {
                        transaction.setUserName(line.substring(USER_NAME_PREFIX.length()));
                    } else if (line.startsWith(USER_ID_PREFIX)) {
                        transaction.setUserId(line.substring(USER_ID_PREFIX.length()));
                    } else if (line.startsWith(COMMIT_MESSAGE_PREFIX)) {
                        transaction.setCommitMessage(line.substring(COMMIT_MESSAGE_PREFIX.length()));
                    } else if (!line.isBlank() && !line.startsWith("#")) {
                        UpdateFactory.create(line).forEach(update -> {
                            if (update instanceof UpdateDataDelete) {
                                transaction.getDeleted().addAll(((UpdateDataDelete) update).getQuads());
                            } else if (update instanceof UpdateDataInsert) {
                                transaction.getAdded().addAll(((UpdateDataInsert) update).getQuads());
                            }
                        });
                    }
                }
            }

            return transaction;
        } catch (RuntimeException e) {
            throw new IOException(e);
        }
    }
}
