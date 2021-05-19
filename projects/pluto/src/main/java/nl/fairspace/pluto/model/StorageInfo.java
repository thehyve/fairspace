package nl.fairspace.pluto.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.Set;

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
