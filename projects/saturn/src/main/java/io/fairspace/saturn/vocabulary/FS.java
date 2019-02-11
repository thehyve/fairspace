package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Resource;

import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class FS {
    public static final String uri = "http://fairspace.io/ontology#";

    public static final Resource Collection = createResource(uri + "Collection");
    public static final Resource Directory = createResource(uri + "Directory");
    public static final Resource File = createResource(uri + "File");
}
