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

    @Autowired
    private PredicateService predicateService;

    public Model retrieveMetadata(String uri) {
        Model triples = tripleService.retrieveTriples(uri);
        Set<String> predicates = triples.listStatements().toList().stream()
                .map(statement -> statement.getPredicate().getURI())
                .collect(Collectors.toSet());
        List<PredicateInfo> predicateInfos = predicateService.retrievePredicateInfos(predicates);

        predicateInfos.forEach(predicateInfo -> {
            Resource predicate = triples.createResource(predicateInfo.getUri());
            triples.add(predicate, RDF.type, RDF.Property);
            triples.add(predicate, RDFS.label, predicateInfo.getLabel());
        });

        return triples;
    }

    public void postTriples(Model triples) {
        tripleService.postTriples(triples);
    }

    public void deleteTriples(Model triples) {
        tripleService.deleteTriples(triples);
    }

    public PredicateInfo getPredicateInfo(String uri) {
        return predicateService.retrievePredicateInfo(uri);
    }

    public void postPredicateInfoList(List<PredicateInfo> predicateInfoList) {
        predicateService.insertPredicateList(predicateInfoList);
    }

    public void postPredicateInfo(PredicateInfo predicateInfo) {
        predicateService.insertPredicate(predicateInfo);
    }

}
