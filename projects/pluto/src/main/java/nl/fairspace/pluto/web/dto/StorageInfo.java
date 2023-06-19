package nl.fairspace.pluto.web.dto;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class StorageInfo {
    private String name;
    private String label;
    private String path;
    private String searchPath;
    private String rootDirectoryIri;
}
