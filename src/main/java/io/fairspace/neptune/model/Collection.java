package io.fairspace.neptune.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;

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

    private CollectionType type = CollectionType.LOCAL_FILE;
    private String typeIdentifier;

    @Transient
    private CollectionMetadata metadata;

    public Collection addMetadata(CollectionMetadata metadata) {
        return new Collection(id, type, typeIdentifier, metadata);
    }
}
