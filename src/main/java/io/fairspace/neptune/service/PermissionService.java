package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.UnauthorizedException;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.repository.PermissionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final CollectionRepository collectionRepository;
    private final AuthorizationContainer authorizationContainer;

    @Autowired
    public PermissionService(PermissionRepository permissionRepository, CollectionRepository collectionRepository, AuthorizationContainer authorizationContainer) {
        this.permissionRepository = permissionRepository;
        this.collectionRepository = collectionRepository;
        this.authorizationContainer = authorizationContainer;
    }

    public List<Permission> getByCollection(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);
        checkPermission(Access.Read, collectionId);
        return permissionRepository.findByCollection(collection);
    }

    public List<Permission> getAllBySubject() {
        return permissionRepository.findBySubject(getSubject());
    }

    public Permission getSubjectsPermission(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);

        String subject = getSubject();
        return permissionRepository.findBySubjectAndCollection(subject, collection)
                .orElseGet(() -> new Permission(null, subject, collection, Access.None));
    }

    /**
     * Authorize the subject currently logged in to have access to the given collection
     * @param collection
     * @param access
     * @param isNew
     * @return
     * @see #getSubject()
     */
    public Permission authorize(Collection collection, Access access, boolean isNew) {
        return authorize(getSubject(), collection, access, isNew);
    }

    /**
     * Authorize the given subject to have access to the given collection
     * @param subject
     * @param collection
     * @param access
     * @param isNew
     * @return
     */
    public Permission authorize(String subject, Collection collection, Access access, boolean isNew) {
        return authorize(
                Permission.builder()
                        .subject(subject)
                        .collection(collection)
                        .access(access)
                        .build(), isNew);
    }

    public Permission authorize(Permission permission, boolean isNew) {
        if (!isNew) {
            checkPermission(Access.Manage, permission.getCollection().getId());
        }

        return permissionRepository.findBySubjectAndCollection(permission.getSubject(), permission.getCollection())
                .map(existing -> {
                    if (permission.getAccess() == Access.None) {
                        permissionRepository.delete(existing);
                        return permission;
                    }

                    Permission newPermission = existing.toBuilder().access(permission.getAccess()).build();
                    return permissionRepository.save(newPermission);
                }).orElseGet(() -> {
                    if (permission.getAccess() == Access.None) {
                        return permission;
                    }
                    return permissionRepository.save(permission);
                });
    }

    public String getSubject() {
        try {
            return Objects.requireNonNull(authorizationContainer.getSubject());
        } catch (Exception e) {
            throw new UnauthorizedException("No valid authorization", e);
        }
    }

    boolean hasPermission(Access required, Long collectionId) {
        return required.compareTo(getSubjectsPermission(collectionId).getAccess()) <= 0;
    }

    void checkPermission(Access required, Long collectionId) {
        if (!hasPermission(required, collectionId)) {
            throw new UnauthorizedException("Unauthorized");
        }
    }

    public Permission getUserPermissionByLocation(String location) {
        Collection collection = collectionRepository.findByLocation(location).orElseThrow(CollectionNotFoundException::new);
        return getSubjectsPermission(collection.getId());
    }
}
