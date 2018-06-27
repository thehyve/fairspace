package io.fairspace.neptune.metadata.ceres;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.net.URI;

@Data
@AllArgsConstructor
public class RdfTripleObject {

    private String type;
    private String value;
    private String lang;
    private URI datatype;

}
