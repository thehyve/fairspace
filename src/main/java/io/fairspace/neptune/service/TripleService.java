package io.fairspace.neptune.service;

import org.apache.jena.rdf.model.Model;
import org.springframework.stereotype.Service;


@Service
public interface TripleService {

    Model retrieveTriples(String uri);

    void deleteTriples(Model triples);

    void postTriples(Model triples);

    void patchTriples(Model triples);

    Model executeConstructQuery(String query);
}
