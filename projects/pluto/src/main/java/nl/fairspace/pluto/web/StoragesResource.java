package nl.fairspace.pluto.web;

import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.StorageInfo;

import static nl.fairspace.pluto.config.Urls.STORAGES_PATH;

@RestController
@Slf4j
public class StoragesResource {

    @Autowired
    PlutoConfig plutoConfig;

    /**
     * GET  /api/storages/ : returns configured external storages.
     *
     * @return the external storages.
     */
    @GetMapping(STORAGES_PATH)
    public ResponseEntity<List<StorageInfo>> storages() {
        log.trace("REST request to list external storages");
        var storages = plutoConfig.getStorages().values().stream()
                .map(storage -> new StorageInfo(
                        storage.getName(),
                        storage.getLabel(),
                        String.format("/api/storages/%s/webdav", storage.getName()),
                        StringUtils.hasText(storage.getSearchUrl())
                                ? String.format("/api/storages/%s/search", storage.getName())
                                : null,
                        storage.getRootDirectoryIri()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(storages);
    }
}
