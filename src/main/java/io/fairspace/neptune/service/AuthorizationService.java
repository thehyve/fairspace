package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.AuthorizationRepository;
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
public class AuthorizationService {
    private final AuthorizationRepository authorizationRepository;
    private final CollectionRepository collectionRepository;
    private final AuthorizationContainer authorizationContainer;

    @Value("app.oauth2.superuser-authority")
    private String superuserAuthority;

    @Autowired
    public AuthorizationService(AuthorizationRepository authorizationRepository, CollectionRepository collectionRepository, AuthorizationContainer authorizationContainer) {
        this.authorizationRepository = authorizationRepository;
        this.collectionRepository = collectionRepository;
        this.authorizationContainer = authorizationContainer;
    }

    public List<Authorization> getByCollection(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);
        checkPermission(Permission.Read, collectionId);
        return authorizationRepository.findByCollectionId(collection);
    }

    public List<Authorization> getAllByCurrentUser() {
        return authorizationRepository.findByUser(getCurrentUser());
    }

    public Authorization getUserAuthorization(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);

        String user = getCurrentUser();
        return authorizationRepository.findByUserAndCollectionId(user, collection)
                .orElseGet(() -> new Authorization(null, user, collectionId, Permission.None));
    }

    public Authorization authorize(Authorization authorization, boolean isNew) {
        Collection collection = collectionRepository.findById(authorization.getCollectionId()).orElseThrow(CollectionNotFoundException::new);

        if (!isNew) {
            checkPermission(Permission.Manage, authorization.getCollectionId());
        }

        return authorizationRepository.findByUserAndCollectionId(authorization.getUser(), collection)
                .map(existing -> {
                    if (authorization.getPermission() == Permission.None) {
                        authorizationRepository.delete(existing);
                        return authorization;
                    }

                    existing.setPermission(authorization.getPermission());
                    return authorizationRepository.save(existing);
                }).orElseGet(() -> {
                    if (authorization.getPermission() == Permission.None) {
                        return authorization;
                    }
                    return authorizationRepository.save(authorization);
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

    boolean hasPermission(Permission required, Long collectionId) {
        return required.compareTo(getUserAuthorization(collectionId).getPermission()) <= 0;
    }

    void checkPermission(Permission required, Long collectionId) {
        if (!hasPermission(required, collectionId)) {
            throw new AccessDeniedException("Unauthorized");
        }
    }
}
