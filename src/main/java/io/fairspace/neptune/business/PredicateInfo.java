package io.fairspace.neptune.business;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class PredicateInfo {

    @Id
    @GeneratedValue
    @JsonIgnore
    private Long id;
    private String label;
    @Column(unique = true)
    private URI uri;

    public URI getUri() {
        return uri;
    }

    public void setUri(URI uri) {
        this.uri = uri;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public PredicateInfo(String label, URI uri) {
        this.label = label;
        this.uri = uri;
    }

}
