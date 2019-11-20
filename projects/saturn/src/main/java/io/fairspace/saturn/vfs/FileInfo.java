package io.fairspace.saturn.vfs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.apache.jena.graph.Node;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

@Getter
@Builder
public class FileInfo implements Comparable<FileInfo> {
    private String path;
    private boolean isDirectory;
    private long size;
    private Instant created;
    private Node createdBy;
    private Instant modified;
    private Node modifiedBy;

    @Builder.Default
    private Map<String, String> customProperties = Collections.emptyMap();

    @Setter
    private boolean readOnly;

    @Override
    public int compareTo(FileInfo o) {
        return isDirectory == o.isDirectory ? path.compareTo(o.path) : isDirectory ? -1 : 1;
    }
}
