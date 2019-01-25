package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class VirtualFileSystemIris {
    public static final Property NAME = createProperty("http://www.w3.org/2000/01/rdf-schema#label");
    public static final Property PARENT = createProperty("http://fairspace.io/ontology/File#parent");
    public static final Property PATH = createProperty("http://fairspace.io/ontology/File#localPath");
    public static final Property CONTENT_LOCATION = createProperty("http://fairspace.io/ontology/File#contentLocation");
    public static final Property DATE_MODIFIED = createProperty("http://schema.org/dateModified");
    public static final Property DATE_CREATED = createProperty("http://schema.org/dateCreated");
    public static final Property CREATOR = createProperty("http://schema.org/creator");
    public static final Property IS_READY = createProperty("http://fairspace.io/ontology/File#isReady");
    public static final Property FILESIZE = createProperty("http://schema.org/fileSize");
    public static final Property CONTENT_TYPE = createProperty("http://fairspace.io/ontology/File#contentType");

    public static final Property RDF_TYPE = createProperty("http://www.w3.org/2000/01/rdf-schema#type");

    public static final Resource TYPE_FILE = createResource("http://fairspace.io/ontology/File");
    public static final Resource TYPE_DIRECTORY = createResource("http://fairspace.io/ontology/Directory");

}
