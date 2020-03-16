package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.jena.vocabulary.RDFS;

import static io.fairspace.saturn.vocabulary.FS.ID_URI;
import static io.fairspace.saturn.vocabulary.FS.WORKSPACE_URI;

@Data
@NoArgsConstructor
@AllArgsConstructor
@RDFType(WORKSPACE_URI)
public class Workspace extends LifecycleAwarePersistentEntity {
    @RDFProperty(value = ID_URI, required = true)
    private String id;

    @RDFProperty(value = RDFS.uri + "label")
    private String name;

    @RDFProperty(value = RDFS.uri + "comment")
    private String description;
}
