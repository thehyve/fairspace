package io.fairspace.neptune.model;

import lombok.Data;

import java.net.URI;

@Data
public class Collection {
    URI uri;
    String name;
    String description;
}
