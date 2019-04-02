package io.fairspace.saturn.services.collections;

import lombok.Value;

@Value
public class CollectionMovedEvent {
    Collection collection;
    String oldLocation;
}
