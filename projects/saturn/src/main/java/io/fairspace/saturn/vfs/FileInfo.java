package io.fairspace.saturn.vfs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

@Getter
@Builder
public class FileInfo {
    private String path;
    private boolean isDirectory;
    private long size;
    private Instant created;
    private String createdBy;
    private Instant modified;
    private String modifiedBy;

    @Builder.Default
    private Map<String, String> customProperties = Collections.emptyMap();

    @Setter
    private boolean readOnly;
}
