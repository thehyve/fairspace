package io.fairspace.saturn.rdf.log;

import org.apache.jena.graph.Node;

public interface TransactionListener {
    void onStart(String commitMessage, String userId, String userName, long timestamp);

    void onAdd(Node graph, Node subject, Node predicate, Node object);

    void onDelete(Node graph, Node subject, Node predicate, Node object);

    void onCommit();

    void onRollback();
}
