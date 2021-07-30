package nl.fairspace.pluto.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static nl.fairspace.pluto.config.Urls.STATUS_PATH;

@RestController
@Slf4j
public class StatusResource {

    /**
     * GET  /api/status : returns status of a current session
     *
     */
    @GetMapping(STATUS_PATH)
    public ResponseEntity<Void> status() {
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
