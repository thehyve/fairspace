package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.LifecycleAwarePersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.AccessInfo;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.graph.Node;
import org.apache.jena.vocabulary.RDFS;

import static io.fairspace.saturn.vocabulary.FS.*;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@RDFType(COLLECTION_URI)
public class Collection extends LifecycleAwarePersistentEntity implements AccessInfo {
    @RDFProperty(value = RDFS.uri + "label", required = true)
    private String name;

    @RDFProperty(value = RDFS.uri + "comment", required = true)
    private String description;

    @RDFProperty(value = CONNECTION_STRING_URI)
    private String connectionString;

    @RDFProperty(value = OWNED_BY_URI)
    private Node ownerWorkspace;

    private Access access;

    private String location;

    public String getConnectionString() {
        return connectionString != null ? connectionString : "";
    }
}
