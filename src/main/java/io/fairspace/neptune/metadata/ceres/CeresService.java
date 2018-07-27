package io.fairspace.neptune.metadata.ceres;

import io.fairspace.neptune.web.JsonldModelConverter;
import io.fairspace.neptune.service.TripleService;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@Slf4j
public class CeresService implements TripleService {
    @Autowired
    private RestTemplate restTemplate;

    @Value("${ceres.url}/model/${ceres.model}/statements/")
    private String statementsEndpoint;

    @Value("${ceres.url}/model/${ceres.model}/query/")
    private String queryEndpoint;

    @Override
    public Model retrieveTriples(@NonNull String uri) {
        try {
            return restTemplate.exchange(statementsEndpoint + "?subject={uri}", HttpMethod.GET, acceptJsonLdHttpEntity(), Model.class, uri).getBody();
        } catch (Exception e) {
            log.error(String.format("An exception occurred while retrieving triples for uri %s: %s", uri, e.getMessage()));
            log.debug("Stacktrace", e);
            throw e;
        }
    }


    @Override
    public void postTriples(Model triples) {
        if (triples.isEmpty()) {
            return;
        }

        try {
            HttpEntity entity = getJsonLdEntity(triples);
            restTemplate.postForEntity(statementsEndpoint, entity, Void.class);
        } catch (Exception e) {
            log.error("An exception occurred while storing {} triples: {}", triples.size(), e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug("Triples being stored: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    @Override
    public Model executeConstructQuery(String query) {
        try {
            return restTemplate.exchange(queryEndpoint + "?query={query}", HttpMethod.GET, acceptJsonLdHttpEntity(), Model.class, query).getBody();
        } catch (Exception e) {
            log.error("An exception occurred while executing construct query {}: {}", query, e.getMessage());
            log.debug("Stacktrace", e);
            throw e;
        }
    }


    @Override
    public void deleteTriples(Model triples) {
        if (triples.isEmpty()) {
            return;
        }
        try {
            HttpEntity entity = getJsonLdEntity(triples);
            restTemplate.exchange(statementsEndpoint, HttpMethod.DELETE, entity, Void.class);
        } catch (Exception e) {
            log.error("An exception occurred while deleting {} triples: {}", triples.size(), e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug("Triples being deleted: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    public void patchTriples(Model triples) {
        if (triples.isEmpty()) {
            return;
        }
        try {
            HttpEntity<Model> entity = getJsonLdEntity(triples);
            restTemplate.exchange(statementsEndpoint, HttpMethod.PATCH, entity, Void.class);
        } catch (HttpClientErrorException e) {
            // We could expect a 404 here if the subject for one of the triples does not exist
            if (e.getRawStatusCode() == 404) {
                log.warn("A status 404 occurred while updating triples. Most probably one of the subjects does not exist.");
                if (log.isDebugEnabled()) {
                    log.debug("Triples being updated: {}", triples.toString());
                }
            } else {
                log.error("A client exception (status {}) occurred while updating {} triples: {}", e.getRawStatusCode(), triples.size(), e.getMessage());
                if (log.isDebugEnabled()) {
                    log.debug("Triples being updated: {}", triples.toString());
                    log.debug("Stacktrace", e);
                }
            }
            throw e;
        } catch (Exception e) {
            log.error("An exception occurred while updating {} triples: {}", triples.size(), e.getMessage());
            if (log.isDebugEnabled()) {
                log.debug("Triples being updated: {}", triples.toString());
                log.debug("Stacktrace", e);
            }
            throw e;
        }
    }

    private HttpEntity<Model> getJsonLdEntity(Model triples) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(JsonldModelConverter.JSON_LD);
        return new HttpEntity<>(triples, httpHeaders);
    }

    private HttpEntity acceptJsonLdHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(JsonldModelConverter.JSON_LD));
        return new HttpEntity<>("", headers);
    }
}
