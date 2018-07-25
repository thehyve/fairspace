package io.fairspace.neptune.metadata.ceres;

import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.service.TripleService;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import lombok.NonNull;
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
import sun.net.www.http.HttpClient;

import java.net.URI;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class CeresService implements TripleService {

    private static final MediaType RDF_JSON_MEDIA_TYPE = new MediaType("application", "rdf+json");

    @Autowired
    RestTemplate restTemplate;

    @Value("${ceres.url}/model/${ceres.model}/statements/")
    private String statementsEndpoint;

    @Value("${ceres.url}/model/${ceres.model}/query/")
    private String queryEndpoint;

    public List<Triple> retrieveTriples(@NonNull URI uri) {
        try {
            RdfJsonPayload result =
                    restTemplate.exchange(statementsEndpoint + "?subject={uri}", HttpMethod.GET, acceptRdfJsonHttpEntity(), RdfJsonPayload.class, uri).getBody();
            return TriplesRdfJsonConverter.convertRdfToTriples(result);
        } catch(Exception e) {
            log.error(String.format("An exception occurred while retrieving triples for uri %s: %s", uri.toString(), e.getMessage()));
            log.debug("Stacktrace", e);
            throw e;
        }
    }


    public void postTriples(List<Triple> triples) {
        if(triples.isEmpty()) {
            return;
        }

        try {
            HttpEntity entity = getRdfJsonEntity(triples);
            restTemplate.postForEntity(statementsEndpoint, entity, Void.class);
        } catch(Exception e) {
            log.error("An exception occurred while storing {} triples: {}", triples.size(), e.getMessage());
            if(log.isDebugEnabled()) {
                log.debug("Triples being stored: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    @Override
    public List<Triple> executeConstructQuery(String query) {
        try {
            RdfJsonPayload result =
                    restTemplate.exchange(queryEndpoint + "?query={query}", HttpMethod.GET, acceptRdfJsonHttpEntity(), RdfJsonPayload.class, query).getBody();
            return TriplesRdfJsonConverter.convertRdfToTriples(result);
        } catch(Exception e) {
            log.error("An exception occurred while executing construct query {}: {}", query, e.getMessage());
            log.debug("Stacktrace", e);
            throw e;
        }
    }


    public void deleteTriples(List<Triple> triples) {
        if(triples.isEmpty()) {
            return;
        }
        try {
            HttpEntity entity = getRdfJsonEntity(triples);
            restTemplate.exchange(statementsEndpoint, HttpMethod.DELETE, entity, Void.class);
        } catch(Exception e) {
            log.error("An exception occurred while deleting {} triples: {}", triples.size(), e.getMessage());
            if(log.isDebugEnabled()) {
                log.debug("Triples being deleted: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    public void patchTriples(List<Triple> triples) {
        if(triples.isEmpty()) {
            return;
        }
        try {
            HttpEntity entity = getRdfJsonEntity(triples);
            restTemplate.exchange(statementsEndpoint, HttpMethod.PATCH, entity, Void.class);
        } catch(HttpClientErrorException e) {
            // We could expect a 404 here if the subject for one of the triples does not exist
            if(e.getRawStatusCode() == 404) {
                log.warn("A status 404 occurred while updating triples. Most probably one of the subjects does not exist.");
                if(log.isDebugEnabled()) {
                    log.debug("Triples being updated: {}", triples.toString());
                }
            } else {
                log.error("A client exception (status {}) occurred while updating {} triples: {}", e.getRawStatusCode(), triples.size(), e.getMessage());
                if(log.isDebugEnabled()) {
                    log.debug("Triples being updated: {}", triples.toString());
                    log.debug("Stacktrace", e);
                }
            }
            throw e;
        } catch(Exception e) {
            log.error("An exception occurred while updating {} triples: {}", triples.size(), e.getMessage());
            if(log.isDebugEnabled()) {
                log.debug("Triples being updated: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    private HttpEntity getRdfJsonEntity(List<Triple> triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(RDF_JSON_MEDIA_TYPE);
        return new HttpEntity(TriplesRdfJsonConverter.convertTriplesToRdf(triples), httpHeaders);
    }

    private HttpEntity acceptRdfJsonHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(RDF_JSON_MEDIA_TYPE));
        return new HttpEntity<>("", headers);
    }
}
