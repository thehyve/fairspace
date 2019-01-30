package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.UpdateFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashSet;

import static io.fairspace.saturn.rdf.transactions.SparqlTransactionSerializer.*;

/**
 * Deserializes transactions serialized by SparqlTransactionSerializer
 */
public class SparqlTransactionDeserializer implements TransactionDeserializer {
    public static final TransactionDeserializer INSTANCE = new SparqlTransactionDeserializer();

    private SparqlTransactionDeserializer() {
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
