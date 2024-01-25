package nl.fairspace.pluto.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.MetadataSourceInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import static nl.fairspace.pluto.config.Urls.METADATA_SOURCES_PATH;

@RestController
@Slf4j
@RequiredArgsConstructor
public class MetadataSourcesResource {

    private final PlutoConfig plutoConfig;

    /**
     * GET  /api/metadata-sources/ : returns configured external metadata sources.
     *
     * @return the external metadata sources.
     */
    @GetMapping(METADATA_SOURCES_PATH)
    public ResponseEntity<List<MetadataSourceInfo>> metadataSources() {
        log.trace("REST request to list external metadata sources");
        var metadataSources = plutoConfig.getMetadataSources().values().stream()
                .map(source -> new MetadataSourceInfo(
                        source.getName(),
                        source.getLabel(),
                        String.format("/api/metadata-sources/%s", source.getName())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(metadataSources);
    }
}
