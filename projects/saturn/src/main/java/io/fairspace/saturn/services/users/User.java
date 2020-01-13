package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.vocabulary.RDFS;

import java.util.EnumSet;
import java.util.Set;

import static io.fairspace.saturn.vocabulary.FS.*;

@RDFType(USER_URI)
@EqualsAndHashCode(callSuper = true)
@Data
public class User extends PersistentEntity {
    @RDFProperty(value = RDFS.uri + "label", required = true)
    private String name;

    @RDFProperty(EMAIL_URI)
    private String email;

    @RDFProperty(value = HAS_ROLE_URI, required = true)
    private final Set<Role> roles = EnumSet.noneOf(Role.class);

    private boolean isAdmin;
}
