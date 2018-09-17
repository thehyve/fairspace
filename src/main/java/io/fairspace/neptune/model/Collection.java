package io.fairspace.neptune.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Getter
@EqualsAndHashCode
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Collection {
    public enum CollectionType {
        LOCAL_FILE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @JsonIgnore
    private final CollectionType type = CollectionType.LOCAL_FILE;

    private String location;

    @Column(nullable = false)
    private String name;

    @Column(length = 10000)
    private String description;

    @Transient
    private String uri;

    @Transient
    private Access access;

    // Do not create get method, because we need to customize it.
    @Getter(AccessLevel.NONE)
    @Setter
    ZonedDateTime creationDateTime;

    public ZonedDateTime getCreationDateTime () {
        return creationDateTime == null ? null : creationDateTime.withZoneSameInstant(ZoneOffset.UTC);
    }

    @Setter
    String creator;
}
