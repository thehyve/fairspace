package nl.fairspace.pluto.web;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;

import static nl.fairspace.pluto.config.Urls.ICONS_PATH;

@RestController
@Slf4j
@AllArgsConstructor
public class IconsResource {

    private final PlutoConfig plutoConfig;
    /**
     * GET  /api/iconsvg/{icon_name} : returns an icon of specified name if exists.
     */
    @GetMapping(value = ICONS_PATH + "{icon_name}", produces = "image/svg+xml")
    public ResponseEntity<byte[]> iconsvg(@PathVariable String icon_name) {
        try {
            InputStream in = getSvgIconInputStream(icon_name);
            if (in == null || in.available() == 0) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(IOUtils.toByteArray(in));
        } catch (IOException e) {
            log.error("Error reading image", e);
            return ResponseEntity.notFound().build();
        }
    }

    public String getIconUrl(String name) {
        if (plutoConfig.getIcons().containsKey(name)) {
            return String.format("%s%s", ICONS_PATH, name);
        }
        return null;
    }


    private InputStream getSvgIconInputStream(String iconName) {
        String iconPath = plutoConfig.getIcons().get(iconName);
        if (iconPath == null) {
            return null;
        }
        return getClass().getResourceAsStream(iconPath);
    }
}
