package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.vocabulary.*;
import lombok.extern.slf4j.*;
import org.apache.jena.graph.*;
import org.apache.jena.vocabulary.*;

import java.net.*;
import java.nio.charset.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.Date;
import java.util.stream.*;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;
import static io.fairspace.saturn.services.views.ViewStoreClientFactory.protectedResources;

@Slf4j
public class ViewUpdater {
    private final ViewStoreClient viewStoreClient;
    private final Graph graph;

    public ViewUpdater(ViewStoreClient viewStoreClient, Graph graph) {
        this.viewStoreClient = viewStoreClient;
        this.graph = graph;
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

    private static String getLabel(Graph graph, Node subject) {
        var labelNode = graph.find(subject, RDFS.label.asNode(), Node.ANY)
                .mapWith(Triple::getObject)
                .nextOptional().orElse(null);
        if (labelNode == null) {
            return null;
        }
        return labelNode.toString(false);
    }

    public void updateSubject(Node subject) {
        if (!subject.isURI()) {
            return;
        }
        var typeNode = graph.find(subject, RDF.type.asNode(), Node.ANY).nextOptional();
        if (typeNode.isEmpty()) {
            log.debug("Subject {} has no type!", subject.getURI());
            return;
        }
        var start = new Date().getTime();
        var type = typeNode.get().getObject();
        log.debug("Subject {} of type {}", subject.getURI(), type.getLocalName());
        VIEWS_CONFIG.views.stream().filter(view -> view.types.contains(type.getURI())).forEach(view -> {
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
                row.put("label", getLabel(graph, subject));
                if (protectedResources.contains(type.getURI())) {
                    // set collection name
                    var rootLocation = CONFIG.publicUrl + "/api/webdav" + "/";
                    if (!subject.getURI().startsWith(rootLocation)) {
                        log.error("Unexpected protected resource identifier: {}", subject.getURI());
                        log.error("Protected resource identifier should start with {}", rootLocation);
                        throw new IllegalStateException("Unexpected resource identifier: " + subject.getURI());
                    }
                    var location = subject.getURI().substring(rootLocation.length());
                    var collection = URLDecoder.decode(location.split("/")[0], StandardCharsets.UTF_8);
                    row.put("collection", collection);
                }
                // Update subject value columns
                try {
                    for (var column: view.columns) {
                        var objects = retrieveValues(graph, subject, column.source);
                        if (objects.isEmpty()) {
                            continue;
                        }
                        switch (column.type) {
                            case Number -> row.put(column.name, objects.get(0).getLiteralValue());
                            case Date -> {
                                row.put(column.name, Instant.parse(objects.get(0).getLiteralValue().toString()));
                            }
                            case Term, TermSet -> {
                                var term = objects.get(0);
                                var label = getLabel(graph, term);
                                viewStoreClient.addLabel(term.getURI(), column.rdfType, label);
                                row.put(column.name, label);
                            }
                            default -> row.put(column.name, objects.get(0).getLiteralValue().toString());
                        }
                    }
                    viewStoreClient.updateRow(view.name, row);
                } catch (SQLException e) {
                    log.error("Failed to update view row", e);
                }
                // Update subject value sets
                for (ViewsConfig.View.Column column: view.columns) {
                    if (!column.type.isSet()) {
                        continue;
                    }
                    var objects = retrieveValues(graph, subject, column.source);
                    if (objects.isEmpty()) {
                        // continue;
                    }
                    try {
                        var values = new HashSet<String>();
                        for (var term: objects) {
                            if (column.type == ViewsConfig.ColumnType.TermSet) {
                                var label = getLabel(graph, term);
                                viewStoreClient.addLabel(term.getURI(), column.rdfType, label);
                                values.add(label);
                            } else {
                                values.add(term.getLiteralValue().toString());
                            }
                        }
                        viewStoreClient.updateValues(
                                view.name,
                                subject.getURI(),
                                column.name,
                                values);
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
}
