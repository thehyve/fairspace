package io.fairspace.saturn.rdf.transactions;


import org.apache.jena.atlas.io.IndentedWriter;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.UpdateFactory;
import org.apache.jena.update.UpdateRequest;

import java.io.*;
import java.util.ArrayList;
import java.util.HashSet;

public class SparqlTransactionCodec implements TransactionCodec {
    private static final String TIMESTAMP_PREFIX = "# Timestamp: ";
    private static final String USER_NAME_PREFIX = "# User Name: ";
    private static final String USER_ID_PREFIX = "# User ID: ";
    private static final String COMMIT_MESSAGE_PREFIX = "# Commit Message: ";

    @Override
    public void write(TransactionRecord transaction, OutputStream out) throws IOException {
        var writer = new IndentedWriter(out);

        writer.write(TIMESTAMP_PREFIX + transaction.getTimestamp() + "\n") ;
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

        var updateDataDelete = new UpdateDataDelete(new QuadDataAcc(new ArrayList<>(transaction.getDeleted())));
        var updateDataInsert = new UpdateDataInsert(new QuadDataAcc(new ArrayList<>(transaction.getAdded())));

        new UpdateRequest().add(updateDataDelete).add(updateDataInsert).output(writer);
        writer.write("\n# The End\n");
    }

    @Override
    public TransactionRecord read(InputStream in) throws IOException {
        var transaction = new TransactionRecord();
        var queryBuilder = new StringBuilder();
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
                } else {
                    queryBuilder.append(line).append('\n');
                }
            }
        }
        var updateRequest = UpdateFactory.create(queryBuilder.toString());
        var updateDataInsert = (UpdateDataInsert) updateRequest.getOperations()
                .stream()
                .filter(UpdateDataInsert.class::isInstance)
                .findFirst()
                .get();
        transaction.setAdded(new HashSet<>(updateDataInsert.getQuads()));
        var updateDataDelete = (UpdateDataDelete) updateRequest.getOperations()
                .stream()
                .filter(UpdateDataDelete.class::isInstance)
                .findFirst()
                .get();
        transaction.setDeleted(new HashSet<>(updateDataDelete.getQuads()));

        return transaction;
    }
}
