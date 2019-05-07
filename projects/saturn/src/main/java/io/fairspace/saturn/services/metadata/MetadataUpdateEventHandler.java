package io.fairspace.saturn.services.metadata;

@FunctionalInterface
public interface MetadataUpdateEventHandler {
    void onEvent();
}
