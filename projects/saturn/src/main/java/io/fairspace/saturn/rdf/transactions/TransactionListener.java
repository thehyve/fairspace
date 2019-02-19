package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;

public interface TransactionListener {
    default void onBegin(String commitMessage, String userId, String userName, long timestamp) {
    }

    default void onAdd(Node graph, Node subject, Node predicate, Node object) {
    }

    default void onDelete(Node graph, Node subject, Node predicate, Node object) {
    }

    default void onCommit() {
    }

    default void onAbort() {
    }
}
