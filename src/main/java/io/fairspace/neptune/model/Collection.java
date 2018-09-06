package io.fairspace.neptune.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Collection {
    public enum CollectionType {
        LOCAL_FILE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @JsonIgnore
    private CollectionType type = CollectionType.LOCAL_FILE;

    private String location;

    @Transient
    private CollectionMetadata metadata;

    @Transient
    private Access access;

    public Collection withMetadata(CollectionMetadata metadata) {
        return new Collection(id, type, location, metadata, access);
    }

    public Collection withAccess(Access access) {
        return new Collection(id, type, location, metadata, access);
    }
}
