package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.PredicateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class LocalDbPredicateService implements PredicateService {

    @Autowired
    PredicateInfoRepository predicateInfoRepository;

    public void insertPredicate(PredicateInfo predicate) {
        predicateInfoRepository.save(convertToLocalDbPredicate(predicate));
    }

    public void insertPredicateList(List<PredicateInfo> predicateInfoList) {
        predicateInfoRepository.saveAll(convertToListLocalDbPedicates(predicateInfoList));
    }

    public PredicateInfo retrievePredicateInfo(URI uri) {
        List<LocalDbPredicateInfo> predicateInfoList = predicateInfoRepository.findByUri(uri);

        if (predicateInfoList.size() > 0) {
            return predicateInfoList.get(0);
        } else {
            return null;
        }
    }

    public void deletePredicate(PredicateInfo predicate) {
        predicateInfoRepository.delete(convertToLocalDbPredicate(predicate));
    }

    public void deletePredicateList(List<PredicateInfo> predicateInfoList) {
        predicateInfoRepository.deleteAll(convertToListLocalDbPedicates(predicateInfoList));
    }

    private List<LocalDbPredicateInfo> convertToListLocalDbPedicates(List<PredicateInfo> predicateInfoList) {
        List<LocalDbPredicateInfo> localDbPredicateInfoList = new ArrayList<>();
        for (PredicateInfo predicateInfo: predicateInfoList) {
            localDbPredicateInfoList.add(convertToLocalDbPredicate(predicateInfo));
        }
        return  localDbPredicateInfoList;
    }


    private LocalDbPredicateInfo convertToLocalDbPredicate(PredicateInfo predicateInfo) {
        LocalDbPredicateInfo localDbPredicateInfo = new LocalDbPredicateInfo();
        localDbPredicateInfo.setLabel(predicateInfo.getLabel());
        localDbPredicateInfo.setUri(predicateInfo.getUri());
        return localDbPredicateInfo;
    }

//    private PredicateInfo convertToPredicateInfo(LocalDbPredicateInfo localDbPredicateInfo) {
//        return new PredicateInfo(localDbPredicateInfo.getLabel(), localDbPredicateInfo.getUri());
//    }


}
