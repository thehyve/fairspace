package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.PredicateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;

@Service
public class LocalDbPredicateService implements PredicateService {

    @Autowired
    PredicateInfoRepository predicateInfoRepository;

    public void insertPredicate(PredicateInfo predicate) {
        predicateInfoRepository.save(predicate);
    }

    public void insertPredicateList(List<PredicateInfo> predicateInfoList) {
        predicateInfoRepository.saveAll(predicateInfoList);
    }

    public PredicateInfo retrievePredicateInfo(URI uri) {
        List<PredicateInfo> predicateInfoList = predicateInfoRepository.findByUri(uri);

        if (predicateInfoList != null && predicateInfoList.size() > 0) {
            return predicateInfoList.get(0);
        } else {
            //TODO Functional what if no label for predicate?
            return null;
        }
    }

    public void deletePredicate(PredicateInfo predicate) {
        predicateInfoRepository.delete(predicate);
    }

    public void deletePredicateList(List<PredicateInfo> predicateInfoList) {
        predicateInfoRepository.deleteAll(predicateInfoList);
    }

}
