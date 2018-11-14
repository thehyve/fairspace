package io.fairspace.neptune.web;

import io.fairspace.neptune.service.PermissionService;
import io.fairspace.neptune.web.dto.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
public class PermissionController {
    private PermissionService permissionService;
    private Caching caching;

    public PermissionController(
            @Value("${cachingPeriod.permission:60}") int cachePeriod,
            PermissionService permissionService
    ) {
        this.permissionService = permissionService;
        this.caching = new Caching(cachePeriod);
    }

    @GetMapping("/{collectionId}/permissions")
    public ResponseEntity<List<Permission>> getCollectionAuthorizations(@PathVariable Long collectionId) {
        return caching.withCacheControl(permissionService.getByCollection(collectionId).stream()
                        .map(Permission::fromModel)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/permissions")
    public ResponseEntity<Permission> getAuthorizationsByLocation(@RequestParam String location) {
        return caching.withCacheControl(Permission.fromModel(permissionService.getUserPermissionByLocation(location)));
    }

    @PutMapping("/permissions")
    public Permission setAuthorization(@Valid @RequestBody Permission permission) {
        io.fairspace.neptune.model.Permission storedPermission =
                permissionService.authorize(permission.getSubject(), permission.getCollection(), permission.getAccess(), false);
        return Permission.fromModel(storedPermission);
    }


}
