package io.fairspace.neptune;

import com.google.gson.Gson;
import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URI;
import java.util.*;

@RunWith(MockitoJUnitRunner.class)
public class TriplesRdfJsonConverterTests {


    TriplesRdfJsonConverter triplesRdfJsonConverter = new TriplesRdfJsonConverter();

    @Test
    public void convertTriplesToRdfTest() {
        List<Triple> triples = getTriples();
        Map<String,Map<String,List<TripleObject>>> convertedMap = triplesRdfJsonConverter.convertTriplesToRdf(triples);
        Assert.assertEquals(convertedMap, getMap());
    }

    @Test
    public void convertRdfToTriples() {
        Map<String,Map<String,List<Object>>> map = getMap();
        List<Triple> triples = triplesRdfJsonConverter.convertToTriples(map);
        Assert.assertEquals(triples, getTriples());

    }

    private List<Triple> getTriples(){
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        return new ArrayList<>(Arrays.asList(new Triple("test", uriPredicate, tripleObject), new Triple("test1", uriPredicate, tripleObject)));

    }

    private Map<String,Map<String,List<Object>>> getMap(){
        Map<String,Map<String,List<Object>>> map = new LinkedHashMap<>();
        List<Object> tripleObjectList = new ArrayList<>();
        tripleObjectList.add(new TripleObject("Literal", "1", "en", URI.create("http://schema.org/Author")));
        Map<String, List<Object>> nestedMap = new LinkedHashMap<>();
        nestedMap.put("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral", tripleObjectList);
        map.put("test", nestedMap);
        map.put("test1", nestedMap);
       // {test={http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral=[TripleObject(type=Literal, value=1, lang=en, dataType=http://schema.org/Author)]}, test1={http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral=[TripleObject(type=Literal, value=1, lang=en, dataType=http://schema.org/Author)]}}
        return map;

    }

}
