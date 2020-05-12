package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.AccessInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.apache.jena.vocabulary.RDFS;

import static io.fairspace.saturn.vocabulary.FS.*;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@RDFType(WORKSPACE_URI)
public class Workspace extends LifecycleAwarePersistentEntity implements AccessInfo {
    @RDFProperty(value = ID_URI, required = true)
    private String id;

    @RDFProperty(value = RDFS.uri + "label")
    private String name;

    @RDFProperty(value = RDFS.uri + "comment")
    private String description;

    @RDFProperty(value = STATUS_URI)
    private WorkspaceStatus workspaceStatus;

    private Access access;
}
