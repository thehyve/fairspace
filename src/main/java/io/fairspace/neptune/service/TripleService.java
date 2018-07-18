package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Triple;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;

@Service
public interface TripleService {

    List<Triple> retrieveTriples(URI uri);

    void deleteTriples(List<Triple> triples);

    void postTriples(List<Triple> triples);

    List<Triple> executeConstructQuery(String query);
}
