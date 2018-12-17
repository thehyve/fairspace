package io.fairspace.neptune.vocabulary;

import lombok.experimental.UtilityClass;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

@UtilityClass
public class Fairspace {
    public static final String DEFAULT_URI = "http://fairspace.io/ontology#";
    public static final String SCHEMA_ORG_URI = "http://schema.org/";

    private static Resource resource(String local) {
        return ResourceFactory.createResource(DEFAULT_URI+ local);
    }

    private static Property property(String local) {
        return property(DEFAULT_URI,local);
    }

    private static Property property(String uri,String local) {
        return ResourceFactory.createProperty(uri, local);
    }

    public static final Resource Collection = resource("Collection");

    public static final Property description = property("description");

    public static final Property creator = property(SCHEMA_ORG_URI,"creator");

    public static final Property dateCreated = property(SCHEMA_ORG_URI, "dateCreated");
}
