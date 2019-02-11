package io.fairspace.saturn.services.collections;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

@Data
@EqualsAndHashCode(of = "uri")
public class Collection {
    private String uri;
    private String prettyName;
    private String directoryName;
    private String type;
    private String description;
    private String creator;
    private Instant dateCreated;
}
