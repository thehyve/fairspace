package nl.fairspace.pluto.web.dto;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
public class MetadataSourceInfo {
    private String name;
    private String label;
    private String path;
    private String iconPath;
}
