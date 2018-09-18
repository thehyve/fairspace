package io.fairspace.neptune.vocabulary;

import lombok.experimental.UtilityClass;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

@UtilityClass
public class Fairspace {
    public static final String defaultUri = "http://fairspace.io/ontology#";

    private static Resource resource(String local) {
        return ResourceFactory.createResource(defaultUri + local);
    }

    private static Property property(String local) {
        return property(defaultUri,local);
    }

    private static Property property(String uri,String local) {
        return ResourceFactory.createProperty(uri, local);
    }

    public static final Resource Collection = resource("Collection");

    public static final Property name = property("name");

    public static final Property description = property("description");

    public static final Property creator = property("https://schema.org/","creator");

    public static final Property dateCreated = property("https://schema.org/", "dateCreated");
}
