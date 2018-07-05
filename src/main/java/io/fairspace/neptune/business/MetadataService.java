package io.fairspace.neptune.business;

import io.fairspace.neptune.web.CombinedTriplesWithPredicateInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MetadataService {

    @Autowired
    public TripleService tripleService;

    @Autowired
    public PredicateService predicateService;

    public CombinedTriplesWithPredicateInfo retrieveMetadata(URI uri) {
        List<Triple> triples = tripleService.retrieveTriples(uri);
        List<PredicateInfo> predicateInfos = triples.stream()
                .map(Triple::getPredicate)
                .distinct()
                .map(predicate -> predicateService.retrievePredicateInfo(predicate))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
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
