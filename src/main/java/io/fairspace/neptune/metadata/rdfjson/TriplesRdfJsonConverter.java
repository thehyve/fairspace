package io.fairspace.neptune.metadata.rdfjson;

import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import io.fairspace.neptune.metadata.ceres.RdfObject;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.*;

@Component
public class TriplesRdfJsonConverter {

    public List<Triple> convertRdfToTriples(Map<String, Map<String, List<Map<String, String>>>> rdf) {
        List<Triple> triples = new ArrayList<>();
        for (String subject : rdf.keySet()) {
            for (String predicate : rdf.get(subject).keySet()) {
                for (Map<String, String> rdfObject : rdf.get(subject).get(predicate)) {
                    URI datatype = rdfObject.containsKey("dataType") ? URI.create(rdfObject.get("dataType")) : null;
                    TripleObject tripleObject = new TripleObject(rdfObject.getOrDefault("type", null),
                            rdfObject.getOrDefault("value", null),
                            rdfObject.getOrDefault("lang", null), datatype);
                    triples.add(new Triple(subject, URI.create(predicate), tripleObject));
                }
            }
        }
        return triples;
    }

    public Map<String, Map<String, List<RdfObject>>> convertTriplesToRdf(List<Triple> triples) {
        Map<String, Map<String, List<RdfObject>>> rdfJson = new LinkedHashMap<>();
        for (Triple triple : triples) {
            if (!rdfJson.containsKey((triple.getSubject()))) {
                rdfJson.put(triple.getSubject(), new HashMap<>());
            }
            if (!rdfJson.get(triple.getSubject()).containsKey(triple.getPredicate().toString())) {
                rdfJson.get(triple.getSubject()).put(triple.getPredicate().toString(), new ArrayList<>());
            }
            rdfJson.get(triple.getSubject()).get(triple.getPredicate().toString()).add(convertTripleObjectToRdfObject(triple.getObject()));
        }
        return rdfJson;
    }

    private RdfObject convertTripleObjectToRdfObject(TripleObject tripleObject) {
    return new RdfObject(tripleObject.getType(), tripleObject.getValue(),
            tripleObject.getLang(), tripleObject.getDataType());
    }

}
