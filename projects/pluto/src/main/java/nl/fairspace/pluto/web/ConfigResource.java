package nl.fairspace.pluto.web;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.web.dto.ConfigInfo;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.autoconfigure.web.servlet.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static nl.fairspace.pluto.config.Urls.CONFIG_PATH;

@RestController
@Slf4j
public class ConfigResource {

    @Value("${spring.servlet.multipart.max-file-size:1GB}")
    private String maxFileSize;

    @Autowired
    private MultipartProperties multipartProperties;

    /**
     * GET  /api/config : returns configuration properties
     */
    @GetMapping(CONFIG_PATH)
    public ResponseEntity<ConfigInfo> config() {
        var configInfo = ConfigInfo.builder();
        if (maxFileSize != null) {
            configInfo.maxFileSize(maxFileSize);
        }
        if (multipartProperties != null && multipartProperties.getMaxFileSize() != null) {
            configInfo.maxFileSizeBytes(multipartProperties.getMaxFileSize().toBytes());
        }
        return ResponseEntity.ok(configInfo.build());
    }
}
