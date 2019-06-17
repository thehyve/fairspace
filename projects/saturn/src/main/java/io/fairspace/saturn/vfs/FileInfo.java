package io.fairspace.saturn.vfs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Builder
public class FileInfo implements Comparable<FileInfo> {
    private String iri;
    private String path;
    private boolean isDirectory;
    private long size;
    private Instant created;
    private Instant modified;
    @Setter
    private boolean readOnly;

    @Override
    public int compareTo(FileInfo o) {
        return isDirectory == o.isDirectory ? path.compareTo(o.path) : isDirectory ? 1 : -1;
    }
}
