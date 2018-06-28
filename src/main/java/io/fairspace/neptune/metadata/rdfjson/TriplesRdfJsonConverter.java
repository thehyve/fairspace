package io.fairspace.neptune.metadata.rdfjson;

import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.*;

@Component
public class TriplesRdfJsonConverter {

    public List<Triple> convertRdfToTriples(Map<String, Map<String, List<Map<String,String>>>> rdf) {
        List<Triple> triples = new ArrayList<>();
        for (String subject : rdf.keySet()) {
            for (String predicate : rdf.get(subject).keySet()) {
                List<Map<String,String>> objects = rdf.get(subject).get(predicate);
                for (Map<String,String> rdfObject : objects) {
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

    public Map<String, Map<String, List<TripleObject>>> convertTriplesToRdf(List<Triple> triples) {
        Map<String, Map<String, List<TripleObject>>> rdfJson = new LinkedHashMap<>();
        for (Triple triple : triples) {
            if (!rdfJson.keySet().contains(triple.getSubject())) {
                Map<String, List<TripleObject>> predicateMap = new LinkedHashMap<>();
                List<TripleObject> tripleObjectList = new ArrayList<>(Arrays.asList(triple.getObject()));
                predicateMap.put(triple.getPredicate().toString(), tripleObjectList);
                rdfJson.put(triple.getSubject(), predicateMap);
            } else if (rdfJson.keySet().contains(triple.getSubject())) {
                Map<String, List<TripleObject>> predicateMap = rdfJson.get(triple.getSubject());
                if (!predicateMap.keySet().contains(triple.getPredicate().toString())) {
                    List<TripleObject> tripleObjectList = new ArrayList<>(Arrays.asList(triple.getObject()));
                    predicateMap.put(triple.getPredicate().toString(), tripleObjectList);
                } else {
                    List<TripleObject> tripleObjectList = predicateMap.get(triple.getPredicate().toString());
                    tripleObjectList.add(triple.getObject());
                }
            }
        }
        return rdfJson;
    }

}
