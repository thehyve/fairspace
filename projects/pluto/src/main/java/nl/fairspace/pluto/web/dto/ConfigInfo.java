package nl.fairspace.pluto.web.dto;

import lombok.*;

@Builder
@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class ConfigInfo {
    private String maxFileSize;
    private Long maxFileSizeBytes;
}
