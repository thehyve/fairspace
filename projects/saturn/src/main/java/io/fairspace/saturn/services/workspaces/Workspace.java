package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.*;
import io.fairspace.saturn.services.users.*;
import lombok.*;
import org.apache.jena.vocabulary.RDFS;

import java.util.*;

import static io.fairspace.saturn.vocabulary.FS.WORKSPACE_URI;

@Data
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
