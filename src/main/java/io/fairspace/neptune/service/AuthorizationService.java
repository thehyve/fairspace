package io.fairspace.neptune.service;

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

import java.util.List;

@Service
public class AuthorizationService {
    private final AuthorizationRepository authorizationRepository;
    private final CollectionRepository collectionRepository;

    @Value("app.oauth2.superuser-authority")
    private String superuserAuthority;

    @Autowired
    public AuthorizationService(AuthorizationRepository authorizationRepository, CollectionRepository collectionRepository) {
        this.authorizationRepository = authorizationRepository;
        this.collectionRepository = collectionRepository;
    }

    public List<Authorization> getAllUsersAuthorizations(Long collectionId, String user) {
        checkPermission(Permission.Manage, user, collectionId);
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);
        return authorizationRepository.findByCollectionId(collection);
    }

    List<Authorization> findByUser(String user) {
        return authorizationRepository.findByUser(user);
    }

    public Authorization getUserAuthorization(Long collectionId, String user) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);

        return authorizationRepository.findByUserAndCollectionId(user, collection)
                .orElseGet(() -> new Authorization(null, user, collectionId, Permission.None));
    }

    public Authorization add(Authorization authorization, String user) {
        Collection collection = collectionRepository.findById(authorization.getCollectionId()).orElseThrow(CollectionNotFoundException::new);

        checkPermission(Permission.Manage, user, authorization.getCollectionId());

        return authorizationRepository.findByUserAndCollectionId(user, collection)
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

    void checkPermission(Permission required, String user, Long collectionId) {
        Permission permission = getUserAuthorization(collectionId, user).getPermission();
        if (permission.compareTo(required) < 0) {
            throw new AccessDeniedException("Insufficient permissions");
        }
   }
}
