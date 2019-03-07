package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.BasicPersistentEntity;
import io.fairspace.saturn.rdf.dao.RDFProperty;
import io.fairspace.saturn.rdf.dao.RDFType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@RDFType("http://fairspace.io/ontology#Collection")
public class Collection extends BasicPersistentEntity {
    @RDFProperty(value = "http://www.w3.org/2000/01/rdf-schema#label", required = true)
    private String name;

    @RDFProperty(value = "http://www.w3.org/2000/01/rdf-schema#comment", required = true)
    private String description;

    @RDFProperty(value = "http://fairspace.io/ontology#filePath", required = true)
    private String location;

    @RDFProperty(value = "http://fairspace.io/ontology#collectionType", required = true)
    private String type;

    private Access access;
}
