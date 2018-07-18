package io.fairspace.neptune.vocabulary;

import lombok.experimental.UtilityClass;

import java.net.URI;

@UtilityClass
public class Fairspace {
    public static final URI NS = URI.create("http://fairspace.io/ontology#");

    public static final URI COLLECTION = URI.create(NS + "Collection");

    public static final URI NAME = URI.create(NS + "name");

    public static final URI DESCRIPTION = URI.create(NS + "description");
}
