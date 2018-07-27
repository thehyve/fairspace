package io.fairspace.neptune.predicate.db;

import org.springframework.data.repository.CrudRepository;

import java.util.Collection;
import java.util.List;

public interface PredicateInfoRepository extends CrudRepository<LocalDbPredicateInfo, Long> {

    List<LocalDbPredicateInfo> findByUri(String uri);

    List<LocalDbPredicateInfo> findAllByUri(Collection<String> uris);

}
