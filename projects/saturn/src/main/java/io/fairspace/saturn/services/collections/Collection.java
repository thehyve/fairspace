package io.fairspace.saturn.services.collections;

import lombok.Data;

@Data
public class Collection {
    private String uri;
    private String name;
    private String type;
    private String description;
    private String creator;
}
