package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.repository.AuthorizationRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorizationService {
    private final AuthorizationRepository authorizationRepository;
    private final CollectionRepository collectionRepository;


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

    public Authorization add(Authorization authorization) {
        Collection collection = collectionRepository.findById(authorization.getCollectionId()).orElseThrow(CollectionNotFoundException::new);

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
}
