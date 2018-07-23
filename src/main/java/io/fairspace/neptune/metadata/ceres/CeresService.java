package io.fairspace.neptune.metadata.ceres;

import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.service.TripleService;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class CeresService implements TripleService {

    private static final MediaType RDF_JSON_MEDIA_TYPE = new MediaType("application", "rdf+json");

    @Autowired
    RestTemplate restTemplate;
    
    @Autowired
    private HttpServletRequest incomingRequest;

    @Value("${ceres.url}/model/${ceres.model}/statements/")
    private String statementsEndpoint;

    @Value("${ceres.url}/model/${ceres.model}/query/")
    private String queryEndpoint;

    public List<Triple> retrieveTriples(URI uri) {
            RdfJsonPayload result =
                    restTemplate.exchange(statementsEndpoint + "?subject={uri}", HttpMethod.GET, acceptRdfJsonHttpEntity(), RdfJsonPayload.class, uri).getBody();
            return TriplesRdfJsonConverter.convertRdfToTriples(result);
    }


    public void postTriples(List<Triple> triples) {
        HttpEntity entity = getRdfJsonEntity(triples);
        restTemplate.postForEntity(statementsEndpoint, entity, Void.class);
    }

    @Override
    public List<Triple> executeConstructQuery(String query) {
        RdfJsonPayload result =
                restTemplate.exchange(queryEndpoint + "?query={query}", HttpMethod.GET, acceptRdfJsonHttpEntity(), RdfJsonPayload.class, query).getBody();
        return TriplesRdfJsonConverter.convertRdfToTriples(result);
    }


    public void deleteTriples(List<Triple> triples) {
        HttpEntity entity = getRdfJsonEntity(triples);
        restTemplate.exchange(statementsEndpoint, HttpMethod.DELETE, entity, Void.class);
    }

    public void patchTriples(List<Triple> triples) {
        if(!triples.isEmpty()) {
            HttpEntity entity = getRdfJsonEntity(triples);
            restTemplate.exchange(statementsEndpoint, HttpMethod.PATCH, entity, Void.class);
        }
    }

    private HttpEntity getRdfJsonEntity(List<Triple> triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(RDF_JSON_MEDIA_TYPE);
        httpHeaders.set(HttpHeaders.AUTHORIZATION, incomingRequest.getHeader(HttpHeaders.AUTHORIZATION));
        return new HttpEntity(TriplesRdfJsonConverter.convertTriplesToRdf(triples), httpHeaders);
    }

    private HttpEntity acceptRdfJsonHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(RDF_JSON_MEDIA_TYPE));
        headers.set(HttpHeaders.AUTHORIZATION, incomingRequest.getHeader(HttpHeaders.AUTHORIZATION));
        return new HttpEntity<>("", headers);
    }


}
