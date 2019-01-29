package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.QuadAction;

interface GraphChangeListener {
    void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object);
}
