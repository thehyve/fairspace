package io.fairspace.saturn.rdf.dao;

import lombok.Getter;
import lombok.Setter;
import org.apache.jena.graph.Node;

import java.time.Instant;

import static lombok.AccessLevel.PACKAGE;

/**
 * Defines some standard fields, automatically managed by DAO and enables soft deletion.
 */
@Getter
@Setter(PACKAGE)
public abstract class LifecycleAwarePersistentEntity extends PersistentEntity {
    @RDFProperty(value = "http://fairspace.io/ontology#dateCreated", required = true)
    private Instant dateCreated;

    @RDFProperty(value = "http://fairspace.io/ontology#createdBy", required = true)
    private Node createdBy;

    @RDFProperty(value = "http://fairspace.io/ontology#dateModified", required = true)
    private Instant dateModified;

    @RDFProperty(value = "http://fairspace.io/ontology#modifiedBy", required = true)
    private Node modifiedBy;

    @RDFProperty("http://fairspace.io/ontology#dateDeleted")
    private Instant dateDeleted;

    @RDFProperty("http://fairspace.io/ontology#deletedBy")
    private Node deletedBy;
}
