package io.fairspace.neptune.vocabulary;

import lombok.experimental.UtilityClass;

import java.net.URI;

@UtilityClass
public class Rdf {
    public static final URI NS = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#");

    public static final URI TYPE = URI.create(NS + "type");
}
