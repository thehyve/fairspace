package nl.fairspace.pluto.web;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.ConfigInfo;
import nl.fairspace.pluto.web.dto.StorageInfo;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

import static nl.fairspace.pluto.config.Urls.CONFIG_PATH;
import static nl.fairspace.pluto.config.Urls.STATUS_PATH;

@RestController
@Slf4j
public class ConfigResource {

    @Value("${spring.servlet.multipart.max-file-size}")
    private String maxFileSize;

    /**
     * GET  /api/config : returns configuration properties
     */
    @GetMapping(CONFIG_PATH)
    public ResponseEntity<ConfigInfo> config() {
        var configInfo = new ConfigInfo(maxFileSize);
        return ResponseEntity.ok(configInfo);
    }
}
