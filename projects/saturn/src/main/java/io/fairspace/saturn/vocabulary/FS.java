package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Property;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

public class FS {
    public static final String uri = "http://fairspace.io/ontology#";

    public static final Property Collection = createProperty(uri + "Collection");
    public static final Property Directory = createProperty(uri +"Directory");
    public static final Property File = createProperty(uri +"File");
}
