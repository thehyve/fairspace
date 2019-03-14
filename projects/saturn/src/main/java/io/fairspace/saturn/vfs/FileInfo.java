package io.fairspace.saturn.vfs;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class FileInfo {
    String iri;
    String path;
    boolean isDirectory;
    long size;
    Instant created;
    Instant modified;
    boolean readOnly;
}
