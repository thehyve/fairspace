package io.fairspace.neptune.predicate.db;

import org.springframework.data.repository.CrudRepository;

import java.net.URI;
import java.util.List;

public interface PredicateInfoRepository extends CrudRepository<LocalDbPredicateInfo, Long> {

    List<LocalDbPredicateInfo> findByUri(URI uri);

}
