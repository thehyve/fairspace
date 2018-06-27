package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.business.PredicateInfo;
import org.springframework.data.repository.CrudRepository;

import java.net.URI;
import java.util.List;

public interface PredicateInfoRepository extends CrudRepository<PredicateInfo, Long> {

    List<PredicateInfo> findByUri(URI uri);

}
