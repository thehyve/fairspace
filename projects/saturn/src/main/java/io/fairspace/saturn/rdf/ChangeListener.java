package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.QuadAction;

interface ChangeListener {
    void change(QuadAction action, Node g, Node s, Node p, Node o);
}
