package io.fairspace.neptune.repository;

import io.fairspace.neptune.model.Collection;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface CollectionRepository extends CrudRepository<Collection, Long> {
    Optional<Collection> findByLocation(String location);
}
