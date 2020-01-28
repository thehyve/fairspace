package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;

import java.io.IOException;

/**
 * An interface for handling events within a transaction.
 */
public interface TransactionListener {
    default void onBegin() throws IOException {
    }

    default void onMetadata(String userId, String userName, long timestamp) throws IOException {
    }

    default void onAdd(Node graph, Node subject, Node predicate, Node object) throws IOException {
    }

    default void onDelete(Node graph, Node subject, Node predicate, Node object) throws IOException {
    }

    default void onCommit() throws IOException {
    }

    default void onAbort() throws IOException {
    }
}
