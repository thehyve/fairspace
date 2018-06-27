package io.fairspace.neptune.metadata.rdfjson;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.*;

@Component
public class TriplesRdfJsonConverter {

    public List<Triple> convertToTriples(Map<String, Map<String, List<Object>>> result) {
        List<Triple> triples = new ArrayList<>();
        for (String subject : result.keySet()) {
            for (String predicate : result.get(subject).keySet()) {
                List<Object> objects = result.get(subject).get(predicate);
                for (Object rdfObject : objects) {
                    Gson gson = new Gson();
                    JsonElement jsonElement = gson.toJsonTree(rdfObject);
                    TripleObject tripleObject = gson.fromJson(jsonElement, TripleObject.class);
                    triples.add(new Triple(subject, URI.create(predicate), tripleObject));
                }
            }
        }
        return triples;
    }

    public Map<String, Map<String, List<TripleObject>>> convertTriplesToRdf(List<Triple> triples) {
        Map<String, Map<String, List<TripleObject>>> subjectMap = new LinkedHashMap<>();
        for (Triple triple : triples) {
            if (!subjectMap.keySet().contains(triple.getSubject())) {
                Map<String, List<TripleObject>> predicateMap = new LinkedHashMap<>();
                List<TripleObject> tripleObjectList = new ArrayList<>(Arrays.asList(triple.getObject()));
                predicateMap.put(triple.getPredicate().toString(), tripleObjectList);
                subjectMap.put(triple.getSubject(), predicateMap);
            } else if (subjectMap.keySet().contains(triple.getSubject())) {
                Map<String, List<TripleObject>> predicateMap = subjectMap.get(triple.getSubject());
                if (!predicateMap.keySet().contains(triple.getPredicate().toString())) {
                    List<TripleObject> tripleObjectList = new ArrayList<>(Arrays.asList(triple.getObject()));
                    predicateMap.put(triple.getPredicate().toString(), tripleObjectList);
                } else {
                    List<TripleObject> tripleObjectList = predicateMap.get(triple.getPredicate().toString());
                    tripleObjectList.add(triple.getObject());
                }
            }
        }
        return subjectMap;
    }

}
