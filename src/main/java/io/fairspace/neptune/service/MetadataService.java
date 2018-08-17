package io.fairspace.neptune.service;

import io.fairspace.neptune.model.PredicateInfo;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MetadataService {

    @Autowired
    private TripleService tripleService;

    public Model retrieveMetadata(String uri) {
        return tripleService.retrieveTriples(uri);
    }

    public void postTriples(Model triples) {
        tripleService.postTriples(triples);
    }

    public void deleteTriples(Model triples) {
        tripleService.deleteTriples(triples);
    }
}
