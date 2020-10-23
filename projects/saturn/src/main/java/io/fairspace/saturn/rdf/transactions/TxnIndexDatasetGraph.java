package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.rdf.*;
import io.fairspace.saturn.services.views.*;
import io.fairspace.saturn.vocabulary.*;
import lombok.*;
import lombok.extern.slf4j.*;
import org.apache.jena.graph.*;
import org.apache.jena.query.*;
import org.apache.jena.sparql.core.*;
import org.apache.jena.vocabulary.*;

import java.sql.*;
import java.util.*;
import java.util.Date;
import java.util.stream.*;

@Slf4j
public class TxnIndexDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final ViewStoreClient viewStoreClient;
    private final SearchConfig searchConfig;
    // One set of updated subjects if write transactions are handled sequentially.
    // If many write transactions can be active simultaneously, this set needs to be
    // tied to the active thread.
    private final Set<Node> updatedSubjects = new HashSet<>();

    public TxnIndexDatasetGraph(DatasetGraph dsg, ViewStoreClient viewStoreClient) {
        super(dsg);
        this.viewStoreClient = viewStoreClient;
        this.searchConfig = viewStoreClient.getSearchConfig();
    }

    private void markSubject(Node subject) {
        updatedSubjects.add(subject);
    }

    private List<Node> retrieveValues(Graph graph, Node subject, String source) {
        var predicates = source.split("\\s+");
        var nodes = List.of(subject);
        for (var predicate: predicates) {
            var next = new ArrayList<Node>();
            var predicateNode = NodeFactory.createURI(predicate);
            for (var node: nodes) {
                if (node.isLiteral()) {
                    continue;
                }
                next.addAll(graph.find(node, predicateNode, Node.ANY).mapWith(Triple::getObject).toList());
            }
            nodes = next;
        }
        return nodes;
    }

    private void updateSubject(Node subject) {
        if (!subject.isURI()) {
            return;
        }
        var graph = getDefaultGraph();
        var typeNode = graph.find(subject, RDF.type.asNode(), Node.ANY).nextOptional();
        if (typeNode.isEmpty()) {
            log.debug("Subject {} has no type!", subject.getURI());
            return;
        }
        var start = new Date().getTime();
        var type = typeNode.get().getObject();
        log.debug("Subject {} of type {}", subject.getURI(), type.getLocalName());
        searchConfig.views.stream().filter(view -> view.types.contains(type.getURI())).forEach(view -> {
            if (graph.find(subject, FS.dateDeleted.asNode(), Node.ANY).hasNext()) {
                log.debug("Deleting entity {} of type {} from view {}", subject.getURI(), type.getLocalName(), view.name);
                try {
                    viewStoreClient.deleteRow(view.name, subject.getURI());
                } catch (SQLException e) {
                    log.error("Failed to delete row from view", e);
                }
            } else {
                log.debug("Updating entity {} of type {} in view {}", subject.getURI(), type.getLocalName(), view.name);
                var row = new HashMap<String, Object>();
                row.put("id", subject.getURI());
                // Update subject value columns
                for (var column: view.columns) {
                    var objects = retrieveValues(graph, subject, column.source);
                    if (objects.isEmpty()) {
                        continue;
                    }
                    switch(column.type) {
                        case Number -> row.put(column.name, objects.get(0).getLiteralValue());
                        case Set -> {
                            row.put(column.name, objects.stream().map(value -> value.toString(false)).collect(Collectors.toList()));
                            row.put(column.name + "_string", "|" + objects.stream().map(value -> value.toString(false)).collect(Collectors.joining("|")) + "|");
                        }
                        default -> row.put(column.name, objects.get(0).toString(false));
                    }
                }
                try {
                    viewStoreClient.updateRow(view.name, row);
                } catch (SQLException e) {
                    log.error("Failed to update view row", e);
                }
                // Update subject value sets
                for (SearchConfig.View.Column column : view.columns) {
                    if (column.type != SearchConfig.ColumnType.Set) {
                        continue;
                    }
                    var objects = retrieveValues(graph, subject, column.source);
                    if (objects.isEmpty()) {
                        continue;
                    }
                    try {
                        viewStoreClient.updateValues(
                                view.name,
                                subject.getURI(),
                                column.name,
                                objects.stream()
                                        .filter(Node::isLiteral)
                                        .map(Node::getLiteralValue)
                                        .map(Object::toString)
                                        .collect(Collectors.toSet()));
                    } catch (SQLException e) {
                        log.error("Failed to update view value sets", e);
                    }
                }
                // Update subject links
                if (view.join != null) {
                    for (var joinView: view.join) {
                        var relation = NodeFactory.createURI(joinView.on);
                        var objects = joinView.reverse ?
                                graph.find(Node.ANY, relation, subject).mapWith(Triple::getSubject).toList() :
                                graph.find(subject, relation, Node.ANY).mapWith(Triple::getObject).toList();
                        if (objects.isEmpty()) {
                            continue;
                        }
                        try {
                            viewStoreClient.updateLinks(
                                    view.name,
                                    subject.getURI(),
                                    joinView.view,
                                    objects.stream().map(Node::getURI).collect(Collectors.toSet()));
                        } catch (SQLException e) {
                            log.error("Failed to update view links", e);
                        }
                    }
                }
            }
        });
        log.debug("Updating subject of type {} took {}ms", type.getLocalName(), new Date().getTime() - start);
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        switch (action) {
            case ADD, DELETE -> markSubject(subject);
        }
    }

    @Override
    public void begin(TxnType type) {
        begin(TxnType.convert(type));
        updatedSubjects.clear();
    }

    @SneakyThrows
    @Override
    public void commit() {
        if (isInWriteTransaction()) {
            log.debug("Commit updated subjects: {}", updatedSubjects);
            var start = new Date().getTime();
            updatedSubjects.forEach(this::updateSubject);
            viewStoreClient.commit();
            log.debug("Updating {} subjects took {}ms", updatedSubjects.size(), new Date().getTime() - start);
            updatedSubjects.clear();
        }
        super.commit();
    }

    @Override
    public void abort() {
        super.abort();
        if (isInWriteTransaction()) {
            log.debug("Aborting transaction");
            updatedSubjects.clear();
        }
    }

    private boolean isInWriteTransaction() {
        return transactionMode() == ReadWrite.WRITE;
    }
}
