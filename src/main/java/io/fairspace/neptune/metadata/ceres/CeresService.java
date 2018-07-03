package io.fairspace.neptune.metadata.ceres;

import io.fairspace.neptune.business.Triple;
import io.fairspace.neptune.business.TripleService;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CeresService implements TripleService {

    private static final MediaType RDF_JSON_MEDIA_TYPE = new MediaType("application", "rdf+json");
    private static final HttpEntity GET_ENTITY = acceptRdfJsonHttpEntity();

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    TriplesRdfJsonConverter triplesRdfJsonConverter;

    @Value("${ceres.url}")
    URI ceresUri;

    @Value("${ceres.endpoint}")
    private String ceresApiEndpoint;

    public List<Triple> retrieveTriples(URI uri) {
        try {
            Map<String, Map<String, List<Map<String, String>>>> result = restTemplate.exchange(ceresUri + ceresApiEndpoint + "?subject={uri}", HttpMethod.GET, GET_ENTITY, Map.class, uri).getBody();
            return triplesRdfJsonConverter.convertRdfToTriples(result);
        } catch (HttpClientErrorException e) {
            log.error("Error", e);
            throw new RuntimeException("Some context", e);
        }
    }


    public void postTriples(List<Triple> triples) {
        HttpEntity entity = getRdfJsonEntity(triples);
        restTemplate.postForEntity(ceresUri + ceresApiEndpoint, entity, void.class);
    }


    public void deleteTriples(List<Triple> triples) {
        HttpEntity entity = getRdfJsonEntity(triples);
        restTemplate.exchange(ceresUri + ceresApiEndpoint, HttpMethod.DELETE, entity, void.class);
    }

    private HttpEntity getRdfJsonEntity(List<Triple> triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(RDF_JSON_MEDIA_TYPE);
        return new HttpEntity(triplesRdfJsonConverter.convertTriplesToRdf(triples), httpHeaders);
    }

    private static HttpEntity acceptRdfJsonHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(RDF_JSON_MEDIA_TYPE));
        return new HttpEntity<>("", headers);
    }


}
