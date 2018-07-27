package io.fairspace.neptune.service;

import io.fairspace.neptune.model.PredicateInfo;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public interface PredicateService {

    void insertPredicate(PredicateInfo predicateInfo);

    void insertPredicateList(Collection<PredicateInfo> predicateInfoList);

    PredicateInfo retrievePredicateInfo(String uri);

    List<PredicateInfo> retrievePredicateInfos(Collection<String> uris);
}
