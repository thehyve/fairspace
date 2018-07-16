package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.model.PredicateInfo;
import io.fairspace.neptune.service.PredicateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocalDbPredicateService implements PredicateService {

    @Autowired
    PredicateInfoRepository predicateInfoRepository;

    @Override
    public void insertPredicate(PredicateInfo predicate) {
        predicateInfoRepository.save(convertToLocalDbPredicate(predicate));
    }

    @Override
    public void insertPredicateList(Collection<PredicateInfo> predicateInfoList) {
        predicateInfoRepository.saveAll(convertToListLocalDbPedicates(predicateInfoList));
    }

    @Override
    public PredicateInfo retrievePredicateInfo(URI uri) {
        List<LocalDbPredicateInfo> predicateInfoList = predicateInfoRepository.findByUri(uri);

        if (!predicateInfoList.isEmpty()) {
            return convertToPredicateInfo(predicateInfoList.get(0));
        } else {
            return null;
        }
    }

    @Override
    public List<PredicateInfo> retrievePredicateInfos(Collection<URI> uris) {
        return predicateInfoRepository.findAllByUri(uris).stream()
                .map(this::convertToPredicateInfo)
                .collect(Collectors.toList());
    }

    private List<LocalDbPredicateInfo> convertToListLocalDbPedicates(Collection<PredicateInfo> predicateInfoList) {
        return  predicateInfoList.stream()
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
