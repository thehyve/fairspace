package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.repository.PermissionRepository;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;

@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final CollectionRepository collectionRepository;
    private final AuthorizationContainer authorizationContainer;

    @Value("app.oauth2.superuser-authority")
    private String superuserAuthority;

    @Autowired
    public PermissionService(PermissionRepository permissionRepository, CollectionRepository collectionRepository, AuthorizationContainer authorizationContainer) {
        this.permissionRepository = permissionRepository;
        this.collectionRepository = collectionRepository;
        this.authorizationContainer = authorizationContainer;
    }

    public List<Permission> getByCollection(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);
        checkPermission(Access.Read, collectionId);
        return permissionRepository.findByCollectionId(collection);
    }

    public List<Permission> getAllByCurrentUser() {
        return permissionRepository.findByUser(getCurrentUser());
    }

    public Permission getUserPermission(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);

        String user = getCurrentUser();
        return permissionRepository.findByUserAndCollectionId(user, collection)
                .orElseGet(() -> new Permission(null, user, collectionId, Access.None));
    }

    public Permission authorize(Permission permission, boolean isNew) {
        Collection collection = collectionRepository.findById(permission.getCollectionId()).orElseThrow(CollectionNotFoundException::new);

        if (!isNew) {
            checkPermission(Access.Manage, permission.getCollectionId());
        }

        return permissionRepository.findByUserAndCollectionId(permission.getUser(), collection)
                .map(existing -> {
                    if (permission.getAccess() == Access.None) {
                        permissionRepository.delete(existing);
                        return permission;
                    }

                    existing.setAccess(permission.getAccess());
                    return permissionRepository.save(existing);
                }).orElseGet(() -> {
                    if (permission.getAccess() == Access.None) {
                        return permission;
                    }
                    return permissionRepository.save(permission);
                });
    }

    @NotNull
    public String getCurrentUser() {
        try {
            return Objects.requireNonNull(authorizationContainer.getSubject());
        } catch (Exception e) {
            throw new AccessDeniedException("No valid authorization", e);
        }
    }

    boolean hasPermission(Access required, Long collectionId) {
        return required.compareTo(getUserPermission(collectionId).getAccess()) <= 0;
    }

    void checkPermission(Access required, Long collectionId) {
        if (!hasPermission(required, collectionId)) {
            throw new AccessDeniedException("Unauthorized");
        }
    }
}
