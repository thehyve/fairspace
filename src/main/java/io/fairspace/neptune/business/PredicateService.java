package io.fairspace.neptune.business;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;

@Service
public interface PredicateService {

    void insertPredicate(PredicateInfo predicateInfo);

    void insertPredicateList(List<PredicateInfo> predicateInfoList);

    void deletePredicate(PredicateInfo predicateInfo);

    void deletePredicateList(List<PredicateInfo> predicateInfoList);

    PredicateInfo retrievePredicateInfo(URI uri);

}
