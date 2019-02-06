package io.fairspace.saturn.services.collections;

import lombok.Data;

@Data
public class Collection {
    private String id;
    private String name;
    private String description;
    private String creator;
}
