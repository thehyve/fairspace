package io.fairspace.saturn.services.metadata.serialization;

import org.apache.jena.rdf.model.Model;

public interface Serializer {
    String serialize(Model model);
    Model deserialize(String input, String baseURI);
}
