package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;

public interface EventsService {
    void permissionAdded(Permission permission, boolean permissionForNewCollection);
    void permissionModified(Permission permission, Access oldAccess);
    void permissionDeleted(Permission permission);

    void collectionAdded(Collection collection);
    void collectionModified(Collection collection, Collection oldCollection);
    void collectionDeleted(Collection collection);
}

