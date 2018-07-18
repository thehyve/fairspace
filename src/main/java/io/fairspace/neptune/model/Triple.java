package io.fairspace.neptune.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.URI;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Triple {
    private String subject;
    private URI predicate;
    private TripleObject object;

}
