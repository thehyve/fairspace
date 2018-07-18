package io.fairspace.neptune.service;

import io.fairspace.neptune.model.PredicateInfo;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.web.CombinedTriplesWithPredicateInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MetadataService {

    @Autowired
    private TripleService tripleService;

    @Autowired
    private PredicateService predicateService;

    public CombinedTriplesWithPredicateInfo retrieveMetadata(URI uri) {
        List<Triple> triples = tripleService.retrieveTriples(uri);
        Set<URI> predicates = triples.stream()
                .map(Triple::getPredicate)
                .collect(Collectors.toSet());
        List<PredicateInfo> predicateInfos = predicateService.retrievePredicateInfos(predicates);

        return new CombinedTriplesWithPredicateInfo(triples, predicateInfos);
    }

    public void postTriples(List<Triple> triples) {
        tripleService.postTriples(triples);
    }

    public void deleteTriples(List<Triple> triples) {
        tripleService.deleteTriples(triples);
    }

    public PredicateInfo getPredicateInfo(URI uri) {
        return predicateService.retrievePredicateInfo(uri);
    }

    public void postPredicateInfoList(List<PredicateInfo> predicateInfoList) {
        predicateService.insertPredicateList(predicateInfoList);
    }

    public void postPredicateInfo(PredicateInfo predicateInfo) {
        predicateService.insertPredicate(predicateInfo);
    }

}
