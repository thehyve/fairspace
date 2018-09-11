package io.fairspace.neptune.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import java.beans.ConstructorProperties;
import java.util.List;

@Getter
@EqualsAndHashCode
@Entity

public class Collection {
    @Builder(toBuilder = true)
    @ConstructorProperties({"id", "location", "name", "description", "uri", "access"})
    public Collection(Long id, String location, String name, String description, String uri, Access access) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.description = description;
        this.uri = uri;
        this.access = access;
    }

    public Collection() {
    }

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

    @JsonIgnore
    @OneToMany
    @JoinColumn(name = "collection_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<Permission> permissions;
}
