package io.fairspace.saturn.webdav.vfs.contents;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@AllArgsConstructor
@Getter
@EqualsAndHashCode
public class StoredContent {
    private String location;
    private long size;
}
