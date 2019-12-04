package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;

/**
 * An interface for handling events within a transaction.
 */
public interface TransactionListener {
    default void onBegin() {}

    default void onMetadata(String userCommitMessage, String systemCommitMessage, String userId, String userName, long timestamp) {}

    default void onAdd(Node graph, Node subject, Node predicate, Node object) {}

    default void onDelete(Node graph, Node subject, Node predicate, Node object) {}

    default void onCommit() {}

    default void onAbort() {}
}
