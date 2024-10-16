package nl.fairspace.pluto.web;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.Service;

import static nl.fairspace.pluto.config.Urls.SERVICES_PATH;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ServicesResource {

    private final PlutoConfig plutoConfig;
    private final IconsResourceService iconsResourceService;

    @GetMapping(SERVICES_PATH)
    public ResponseEntity<List<Service>> services() {
        log.trace("REST request to list configured services");
        var services = plutoConfig.getServices().values().stream()
                .map(service -> new Service(
                        service.getName(), service.getUrl(), iconsResourceService.getIconUrl(service.getIconName())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(services);
    }
}
