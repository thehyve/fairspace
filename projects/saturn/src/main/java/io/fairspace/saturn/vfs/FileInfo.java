package io.fairspace.saturn.vfs;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class FileInfo implements Comparable<FileInfo> {
    String iri;
    String path;
    boolean isDirectory;
    long size;
    Instant created;
    Instant modified;
    boolean readOnly;

    @Override
    public int compareTo(FileInfo o) {
        return isDirectory == o.isDirectory ? path.compareTo(o.path) : isDirectory ? 1 : -1;
    }
}
