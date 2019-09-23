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
        super(eventType, EventCategory.FILE);
        this.path = path;
        this.destination = destination;
    }

    public enum FileEventType {
        CREATE_DIRECTORY,
        LIST,
        COPY,
        MOVE,
        DELETE,

        WRITE_FILE,
        READ_FILE
    }
}

