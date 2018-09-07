package io.fairspace.neptune.repository;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends CrudRepository<Permission, Long> {
    List<Permission> findByCollection(Collection collection);

    List<Permission> findBySubject(String subject);

    Optional<Permission> findBySubjectAndCollection(String subject, Collection collection);
}
