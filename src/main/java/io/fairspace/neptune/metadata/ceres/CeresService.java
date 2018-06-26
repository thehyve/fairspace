package io.fairspace.neptune.metadata.ceres;

import com.google.gson.Gson;
import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleService;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
public class CeresService implements TripleService {

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    HttpEntity httpEntity;

    @Autowired
    TriplesRdfJsonConverter triplesRdfJsonConverter;

    @Autowired
    Gson gson;

    @Value("${ceres.url}")
    URI ceresUri;

    public List<Triple> retrieveTriples(URI uri) {
        Map<String, Map<String, List<Object>>> result = restTemplate.exchange(ceresUri+"/model/mymodel/statements?subject={uri}", HttpMethod.GET, httpEntity, Map.class, uri).getBody();
        return triplesRdfJsonConverter.convertToTriples(result);
    }


    public void postTriples(List<Triple> triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(new MediaType("application", "rdf+json"));
        HttpEntity entity = new HttpEntity(gson.toJson(triplesRdfJsonConverter.convertTriplesToRdf(triples)), httpHeaders);
        restTemplate.postForEntity(ceresUri+"/model/mymodel/statements", entity, void.class);
    }


    public void deleteTriples(List<Triple> triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(new MediaType("application", "rdf+json"));
        HttpEntity entity = new HttpEntity(gson.toJson(triplesRdfJsonConverter.convertTriplesToRdf(triples)), httpHeaders);
        restTemplate.exchange(ceresUri+"/model/mymodel/statements", HttpMethod.DELETE, entity, void.class);
    }


}
