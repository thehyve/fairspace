package io.fairspace.neptune.business;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.URI;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PredicateInfo {

    private String label;
    private URI uri;

}
