package io.fairspace.saturn.services.collections;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

@Data
@EqualsAndHashCode(of = "iri")
public class Collection {
    private String iri;
    private String name;
    private String location;
    private String type;
    private String description;
    private String creator;
    private Instant dateCreated;
    private Access access;
}
