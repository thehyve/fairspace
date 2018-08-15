package io.fairspace.neptune.repository;

import io.fairspace.neptune.model.Collection;
import org.springframework.data.repository.CrudRepository;

public interface CollectionRepository extends CrudRepository<Collection, Long> {}