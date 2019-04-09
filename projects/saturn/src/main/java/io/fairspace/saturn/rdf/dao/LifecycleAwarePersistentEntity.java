package io.fairspace.saturn.rdf.dao;

import lombok.Getter;
import lombok.Setter;
import org.apache.jena.graph.Node;

import java.time.Instant;

import static io.fairspace.saturn.vocabulary.FS.*;
import static lombok.AccessLevel.PACKAGE;

/**
 * Defines some standard fields, automatically managed by DAO and enables soft deletion.
 */
@Getter
@Setter(PACKAGE)
public abstract class LifecycleAwarePersistentEntity extends PersistentEntity {
    @RDFProperty(value = DATE_CREATED_URI, required = true)
    private Instant dateCreated;

    @RDFProperty(value = CREATED_BY_URI, required = true)
    private Node createdBy;

    @RDFProperty(value = DATE_MODIFIED_URI, required = true)
    private Instant dateModified;

    @RDFProperty(value = MODIFIED_BY_URI, required = true)
    private Node modifiedBy;

    @RDFProperty(DATE_DELETED_URI)
    private Instant dateDeleted;

    @RDFProperty(DELETED_BY_URI)
    private Node deletedBy;
}
