package io.fairspace.saturn.webdav.vfs.resources;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
public class VfsUser {
    private String id;
    private String name;
}
