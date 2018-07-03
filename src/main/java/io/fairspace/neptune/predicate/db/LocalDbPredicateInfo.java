package io.fairspace.neptune.predicate.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.fairspace.neptune.business.PredicateInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.net.URI;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocalDbPredicateInfo {

    @Id
    @GeneratedValue
    @JsonIgnore
    private Long id;
    private String label;
    @Column(unique = true)
    private URI uri;

}
