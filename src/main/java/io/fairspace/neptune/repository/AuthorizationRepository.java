package io.fairspace.neptune.repository;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Authorization;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorizationRepository extends CrudRepository<Authorization, Long> {
    List<Authorization> findByCollectionId(Collection collection);

    List<Authorization> findByUser(String user);

    Optional<Authorization> findByUserAndCollectionId(String user, Collection collection);
}
