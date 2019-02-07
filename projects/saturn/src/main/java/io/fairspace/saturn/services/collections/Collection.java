package io.fairspace.saturn.services.collections;

import lombok.Data;

@Data
public class Collection {
    private String uri;
    private String prettyName;
    private String directoryName;
    private String type;
    private String description;
    private String creator;
}
