package io.fairspace.saturn.events;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class FileSystemEvent extends BaseEvent<FileSystemEvent.FileEventType> {
    String path;
    private final String destination;

    @Builder
    public FileSystemEvent(FileEventType eventType, String path, String destination) {
        super(eventType, EventCategory.FILE_SYSTEM);
        this.path = path;
        this.destination = destination;
    }

    public enum FileEventType {
        DIRECTORY_CREATED,
        LISTED,
        COPIED,
        MOVED,
        DELETED,

        FILE_WRITTEN,
        FILE_READ
    }
}

