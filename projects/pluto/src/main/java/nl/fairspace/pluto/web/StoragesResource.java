package nl.fairspace.pluto.web;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.config.dto.*;
import nl.fairspace.pluto.config.dto.PlutoConfig.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
    public ResponseEntity<Collection<Storage>> storages() {
        log.trace("REST request to list external storages");
        return ResponseEntity.ok(plutoConfig.getStorages().values());
    }
}
