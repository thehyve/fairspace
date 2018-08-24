package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;

import java.io.IOException;

public interface StorageService {
    void addCollection(Collection collection) throws IOException;
    void deleteCollection(Collection collection) throws IOException;
}
