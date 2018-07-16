package io.fairspace.neptune.metadata.rdfjson;

import io.fairspace.neptune.metadata.ceres.RdfJsonPayload;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.model.TripleObject;
import io.fairspace.neptune.metadata.ceres.RdfObject;
import lombok.experimental.UtilityClass;
import org.springframework.util.LinkedMultiValueMap;

import java.util.*;

@UtilityClass
public class TriplesRdfJsonConverter {

    public static List<Triple> convertRdfToTriples(RdfJsonPayload rdf) {
        List<Triple> triples = new ArrayList<>();

        rdf.forEach((subject, properties) ->
                properties.forEach((predicate, objects) ->
                        objects.forEach(rdfObject ->
                                triples.add(new Triple(subject, predicate, convert(rdfObject))))));

        return triples;
    }

    public static RdfJsonPayload convertTriplesToRdf(List<Triple> triples) {
        RdfJsonPayload rdfJson = new RdfJsonPayload();
        triples.forEach(triple ->
                rdfJson.computeIfAbsent(triple.getSubject(), key -> new LinkedMultiValueMap<>())
                        .add(triple.getPredicate(), convert(triple.getObject())));
        return rdfJson;
    }

    private static TripleObject convert(RdfObject rdfObject) {
        return new TripleObject(rdfObject.getType(), rdfObject.getValue(),
                        rdfObject.getLang(), rdfObject.getDataType());
    }

    private static RdfObject convert(TripleObject tripleObject) {
        return new RdfObject(tripleObject.getType(), tripleObject.getValue(),
                tripleObject.getLang(), tripleObject.getDataType());
    }

}
