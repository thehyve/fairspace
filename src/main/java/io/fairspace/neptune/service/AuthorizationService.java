package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.repository.AuthorizationRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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


    public List<Authorization> findByCollectionId(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);
        return authorizationRepository.findByCollectionId(collection);
    }

    public List<Authorization> findByUser(String user) {
        return authorizationRepository.findByUser(user);
    }

    public Authorization findByUserAndCollectionId(String user, Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId).orElseThrow(CollectionNotFoundException::new);

        return authorizationRepository.findByUserAndCollectionId(user, collection)
                .orElseGet(() -> new Authorization(null, user, collectionId, Permission.None));
    }

    public Authorization add(Authorization authorization, Authentication user) {
        Collection collection = collectionRepository.findById(authorization.getCollectionId()).orElseThrow(CollectionNotFoundException::new);

        if (user != null) {
            checkPermission(Permission.Manage, user, authorization.getCollectionId());
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

    void checkPermission(Permission required, Authentication user, Long collectionId) {
        if (user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(superuserAuthority))) {
            return;
        }
        Permission permission = findByUserAndCollectionId(user.getName(), collectionId).getPermission();
        if (permission.compareTo(required) < 0) {
            throw new AccessDeniedException("Insufficient permissions");
        }
   }
}
