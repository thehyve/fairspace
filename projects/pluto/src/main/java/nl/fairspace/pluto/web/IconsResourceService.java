package nl.fairspace.pluto.web;

import java.io.InputStream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import nl.fairspace.pluto.config.dto.PlutoConfig;

import static nl.fairspace.pluto.config.Urls.ICONS_PATH;

@Slf4j
@Service
@RequiredArgsConstructor
public class IconsResourceService {

    private final PlutoConfig plutoConfig;

    public String getIconUrl(String name) {
        if (plutoConfig.getIcons().containsKey(name)) {
            return String.format("%s%s", ICONS_PATH, name);
        }
        return null;
    }

    public InputStream getSvgIconInputStream(String iconName) {
        String iconPath = plutoConfig.getIcons().get(iconName);
        if (iconPath == null) {
            return null;
        }
        return getClass().getResourceAsStream(iconPath);
    }
}
