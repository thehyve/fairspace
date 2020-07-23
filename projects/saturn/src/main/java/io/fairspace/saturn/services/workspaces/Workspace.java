package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.vocabulary.RDFS;

import java.time.Instant;

import static io.fairspace.saturn.vocabulary.FS.*;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@RDFType(WORKSPACE_URI)
public class Workspace extends LifecycleAwarePersistentEntity {
    @RDFProperty(value = RDFS.uri + "label")
    private String name;

    @RDFProperty(value = RDFS.uri + "comment")
    private String description;

    @RDFProperty(value = STATUS_URI)
    private WorkspaceStatus status;

    @RDFProperty(value = STATUS_DATE_MODIFIED_URI)
    private Instant statusDateModified;

    @RDFProperty(value = STATUS_MODIFIED_BY_URI)
    private Node statusModifiedBy;

    private boolean canCollaborate;
    private boolean canManage;
}
