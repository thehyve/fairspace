package io.fairspace.callisto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Collection {
    private Long id;
    private String type;
    private String location;
    private String name;
    private String description;
    private String uri;
    private Access access;
    ZonedDateTime dateCreated;
    String creator;
}
