package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import io.fairspace.saturn.vocabulary.FS;
import lombok.Getter;
import lombok.Setter;
import org.apache.jena.vocabulary.RDFS;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static io.fairspace.saturn.vocabulary.FS.*;

@RDFType(USER_URI)
@Getter @Setter
@JsonInclude(NON_NULL)
public class User extends PersistentEntity {
    @RDFProperty(value = ID_URI, required = true)
    public String id;

    @RDFProperty(value = RDFS.uri + "label", required = true)
    private String name;

    @RDFProperty(EMAIL_URI)
    private String email;

    @RDFProperty(USERNAME_URI)
    private String username;

    @RDFProperty(FS.IS_SUPERADMIN_URI)
    @JsonProperty("isSuperadmin")
    private boolean superadmin;

    @RDFProperty(FS.IS_ADMIN_URI)
    @JsonProperty("isAdmin")
    private boolean admin;

    @RDFProperty(FS.CAN_VIEW_PUBLIC_METADATA_URI)
    private boolean canViewPublicMetadata;

    @RDFProperty(FS.CAN_VIEW_PUBLIC_DATA_URI)
    private boolean canViewPublicData;

    @RDFProperty(FS.CAN_ADD_SHARED_METADATA_URI)
    private boolean canAddSharedMetadata;

    @RDFProperty(FS.CAN_QUERY_METADATA_URI)
    private boolean canQueryMetadata;
}
