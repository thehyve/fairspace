package io.fairspace.neptune.business;

import io.fairspace.neptune.web.CombinedTriplesWithPredicateInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class MetadataService {

    @Autowired
    public TripleService tripleService;

    @Autowired
    public PredicateService predicateService;

    public CombinedTriplesWithPredicateInfo retrievMetadata(URI uri) {
        List<Triple> triples = tripleService.retrieveTriples(uri);
        List<PredicateInfo> predicateInfos = new ArrayList<>();
        for (Triple triple : triples) {
            PredicateInfo predicateInfo = predicateService.retrievePredicateInfo(triple.getPredicate());
            if (!predicateInfos.contains(predicateInfo)) {
                predicateInfos.add(predicateInfo);
            }
        }
        return new CombinedTriplesWithPredicateInfo(triples, predicateInfos);
    }

    public void postTriples(List<Triple> triples) {
        tripleService.postTriples(triples);
    }

    public void deleteTriples(List<Triple> triples) {
        tripleService.deleteTriples(triples);
    }

    public void postPredicateInfoList(List<PredicateInfo> predicateInfoList) {
        predicateService.insertPredicateList(predicateInfoList);
    }

    public void deletePredicateInfoList(List<PredicateInfo> predicateInfoList) {
        predicateService.deletePredicateList(predicateInfoList);
    }

    public void postPredicateInfo(PredicateInfo predicateInfo) {
        predicateService.insertPredicate(predicateInfo);
    }

    public void deletePredicateInfo(PredicateInfo predicateInfo) {
        predicateService.deletePredicate(predicateInfo);
    }

}
