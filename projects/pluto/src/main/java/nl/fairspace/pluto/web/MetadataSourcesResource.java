package nl.fairspace.pluto.web;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.MetadataSourceInfo;

import static nl.fairspace.pluto.config.Urls.METADATA_SOURCES_PATH;

@RestController
@Slf4j
@RequiredArgsConstructor
public class MetadataSourcesResource {

    private final PlutoConfig plutoConfig;
    private final IconsResource iconsResource;

    /**
     * GET  /api/metadata-sources/ : returns configured metadata sources.
     *
     * @return the metadata sources.
     */
    @GetMapping(METADATA_SOURCES_PATH)
    public ResponseEntity<List<MetadataSourceInfo>> metadataSources() {
        log.trace("REST request to list external metadata sources");
        var metadataSources = plutoConfig.getMetadataSources().values().stream()
                .map(source -> new MetadataSourceInfo(
                        source.getName(),
                        source.getLabel(),
                        source.getName() != null
                                ? String.format("%s%s", METADATA_SOURCES_PATH, source.getName())
                                : null,
                        iconsResource.getIconUrl(source.getIconName())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(metadataSources);
    }
}
