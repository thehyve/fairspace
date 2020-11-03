package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import io.fairspace.saturn.services.users.User;
import lombok.*;
import org.apache.jena.vocabulary.RDFS;

import java.util.List;

import static io.fairspace.saturn.vocabulary.FS.WORKSPACE_URI;

@Data
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@RDFType(WORKSPACE_URI)
public class Workspace extends LifecycleAwarePersistentEntity {
    @RDFProperty(value = RDFS.uri + "label")
    private String name;

    @RDFProperty(value = RDFS.uri + "comment")
    private String comment;

    @RDFProperty(value = "http://fairspace.io/ontology#workspaceDescription")
    private String description;

    private List<User> managers;
    private WorkspaceSummary summary;
    private boolean canCollaborate;
    private boolean canManage;
}
