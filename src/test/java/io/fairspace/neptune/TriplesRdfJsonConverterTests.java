package io.fairspace.neptune;

import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleObject;
import io.fairspace.neptune.metadata.ceres.RdfObject;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.net.URI;
import java.util.*;

@RunWith(MockitoJUnitRunner.class)
public class TriplesRdfJsonConverterTests {


    TriplesRdfJsonConverter triplesRdfJsonConverter = new TriplesRdfJsonConverter();

    @Test
    public void convertTriplesToRdfTest() {
        List<Triple> triples = getTriples();
        Map<String,Map<String,List<RdfObject>>> convertedMap = triplesRdfJsonConverter.convertTriplesToRdf(triples);
        Assert.assertEquals(convertedMap, getTriplesMap());
    }

    @Test
    public void convertTriplesToRdfMultiplePredicatesTest() {
        List<Triple> triples = getTriplesMultiplePredicates();
        Map<String,Map<String,List<RdfObject>>> convertedMap = triplesRdfJsonConverter.convertTriplesToRdf(triples);
        Assert.assertEquals(convertedMap, getTriplesMapMultiplePredicates());
    }

    @Test
    public void convertTriplesToRdfMultipleObjectsTest() {
        List<Triple> triples = getTriplesMultipleObjects();
        Map<String,Map<String,List<RdfObject>>> convertedMap = triplesRdfJsonConverter.convertTriplesToRdf(triples);
        Assert.assertEquals(convertedMap, getTriplesMapMultipleObjects());
    }

    @Test
    public void convertRdfToTriples() {
        Map<String,Map<String,List<Map<String, String>>>> map = getMap();
        List<Triple> triples = triplesRdfJsonConverter.convertRdfToTriples(map);
        Assert.assertEquals(triples, getTriples());
    }

    private List<Triple> getTriples(){
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        return new ArrayList<>(Arrays.asList(new Triple("test", uriPredicate, tripleObject), new Triple("test1", uriPredicate, tripleObject)));
    }

    private List<Triple> getTriplesMultipleObjects(){
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject1 = new TripleObject(
                "Literal", "1", "en", uri);
        TripleObject tripleObject2 = new TripleObject(
                "Literal", "2", "en", uri);
        URI uriPredicate = URI.create("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral");
        return new ArrayList<>(Arrays.asList(new Triple("test", uriPredicate, tripleObject1), new Triple("test", uriPredicate, tripleObject2)));
    }

    private List<Triple> getTriplesMultiplePredicates(){
        URI uri = URI.create("http://schema.org/Author");
        TripleObject tripleObject = new TripleObject(
                "Literal", "1", "en", uri);
        URI uriPredicate1 = URI.create("http://www.schema.org/Person");
        URI uriPredicate2 = URI.create("http://www.schema.org/Creator");
        return new ArrayList<>(Arrays.asList(new Triple("test", uriPredicate1, tripleObject), new Triple("test", uriPredicate2, tripleObject)));
    }

    private Map<String,Map<String,List<Object>>> getTriplesMap(){
        Map<String,Map<String,List<Object>>> map = new LinkedHashMap<>();
        List<Object> tripleObjectList = new ArrayList<>();
        tripleObjectList.add(new RdfObject("Literal", "1", "en", URI.create("http://schema.org/Author")));
        Map<String, List<Object>> nestedMap = new LinkedHashMap<>();
        nestedMap.put("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral", tripleObjectList);
        map.put("test", nestedMap);
        map.put("test1", nestedMap);
        return map;
    }

    private Map<String,Map<String,List<Object>>> getTriplesMapMultiplePredicates(){
        Map<String,Map<String,List<Object>>> map = new LinkedHashMap<>();
        List<Object> tripleObjectList = new ArrayList<>();
        tripleObjectList.add(new RdfObject("Literal", "1", "en", URI.create("http://schema.org/Author")));
        Map<String, List<Object>> nestedMap = new LinkedHashMap<>();
        String uriPredicate1 = "http://www.schema.org/Person";
        String uriPredicate2 = "http://www.schema.org/Creator";
        nestedMap.put(uriPredicate1, tripleObjectList);
        nestedMap.put(uriPredicate2, tripleObjectList);
        map.put("test", nestedMap);
        return map;
    }

    private Map<String,Map<String,List<Object>>> getTriplesMapMultipleObjects(){
        Map<String,Map<String,List<Object>>> map = new LinkedHashMap<>();
        List<Object> tripleObjectList = new ArrayList<>();
        tripleObjectList.add(new RdfObject("Literal", "1", "en", URI.create("http://schema.org/Author")));
        tripleObjectList.add(new RdfObject("Literal", "2", "en", URI.create("http://schema.org/Author")));
        Map<String, List<Object>> nestedMap = new LinkedHashMap<>();
        nestedMap.put("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral", tripleObjectList);
        map.put("test", nestedMap);
        return map;
    }


    private Map<String,Map<String,List<Map<String, String>>>> getMap(){
        Map<String,Map<String,List<Map<String, String>>>> map = new LinkedHashMap<>();
        List<Map<String, String>> tripleObjectList = new ArrayList<>();
        Map<String, String> nestedNestedMap = new LinkedHashMap<>();
        nestedNestedMap.put("type", "Literal");
        nestedNestedMap.put("value", "1");
        nestedNestedMap.put("lang", "en");
        nestedNestedMap.put("dataType", "http://schema.org/Author");
        tripleObjectList.add(nestedNestedMap);
        Map<String, List<Map<String, String>>> nestedMap = new LinkedHashMap<>();
        nestedMap.put("http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral", tripleObjectList);
        map.put("test", nestedMap);
        map.put("test1", nestedMap);
        return map;
    }

}
