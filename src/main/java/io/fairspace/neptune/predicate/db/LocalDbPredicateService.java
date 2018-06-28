package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.PredicateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
            return convertToPredicateInfo(predicateInfoList.get(0));
        } else {
            return null;
        }
    }

    private List<LocalDbPredicateInfo> convertToListLocalDbPedicates(List<PredicateInfo> predicateInfoList) {
        return predicateInfoList.stream()
                .map(this::convertToLocalDbPredicate)
                .collect(Collectors.toList());
    }



    private LocalDbPredicateInfo convertToLocalDbPredicate(PredicateInfo predicateInfo) {
        LocalDbPredicateInfo localDbPredicateInfo = new LocalDbPredicateInfo();
        localDbPredicateInfo.setLabel(predicateInfo.getLabel());
        localDbPredicateInfo.setUri(predicateInfo.getUri());
        return localDbPredicateInfo;
    }

    private PredicateInfo convertToPredicateInfo(LocalDbPredicateInfo localDbPredicateInfo) {
        return new PredicateInfo(localDbPredicateInfo.getLabel(), localDbPredicateInfo.getUri());
    }


}
