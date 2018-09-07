package io.fairspace.neptune.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Transient;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Entity
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
}
