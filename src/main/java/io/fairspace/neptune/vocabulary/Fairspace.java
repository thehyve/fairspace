package io.fairspace.neptune.vocabulary;

import lombok.experimental.UtilityClass;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

@UtilityClass
public class Fairspace {
    public static final String uri = "http://fairspace.io/ontology#";

    private static Resource resource(String local) {
        return ResourceFactory.createResource(uri + local);
    }

    private static Property property(String local) {
        return ResourceFactory.createProperty(uri, local);
    }

    public static final Resource Collection = resource("Collection");

    public static final Property name = property("name");

    public static final Property description = property("description");

    public static final Property creator = property ("creator");

    public static final Property creationDateTime = property ("creationDateTime");
}
