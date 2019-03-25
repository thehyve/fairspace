package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import lombok.Data;
import lombok.EqualsAndHashCode;

@RDFType("http://fairspace.io/ontology#User")
@EqualsAndHashCode(callSuper = true)
@Data
public class User extends PersistentEntity {
    @RDFProperty(value = "http://fairspace.io/ontology#externalId", required = true)
    private String externalId;

    @RDFProperty(value = "http://www.w3.org/2000/01/rdf-schema#label", required = true)
    private String name;

    @RDFProperty("http://fairspace.io/ontology#email")
    private String email;
}
