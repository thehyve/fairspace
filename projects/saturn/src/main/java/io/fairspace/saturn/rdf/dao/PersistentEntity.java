package io.fairspace.saturn.rdf.dao;

import lombok.Data;
import org.apache.jena.graph.Node;

/**
 * Base class for all persistent entities
 */
@Data
public abstract class PersistentEntity {
    private Node iri;
}
