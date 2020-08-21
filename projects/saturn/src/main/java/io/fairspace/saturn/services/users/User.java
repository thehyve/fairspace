package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
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
    private String id;

    @RDFProperty(value = RDFS.uri + "label", required = true)
    private String name;

    @RDFProperty(EMAIL_URI)
    private String email;

    // Only for the current user
    private Boolean admin;

    // Only for the current user
    private Boolean viewPublicMetadata;

    // Only for the current user
    private Boolean viewPublicData;

    // Only for the current user
    private Boolean addSharedMetadata;

}
