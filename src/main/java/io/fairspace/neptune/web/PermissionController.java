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
    @Autowired
    private PermissionService permissionService;

    @Value("${permissions.cachePeriod}")
    private String cachePeriod;

    @GetMapping("/{collectionId}/permissions")
    public ResponseEntity<List<Permission>> getCollectionAuthorizations(@PathVariable Long collectionId) {
        return withCacheControl(permissionService.getByCollection(collectionId).stream()
                        .map(Permission::fromModel)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/permissions")
    public ResponseEntity<Permission> getAuthorizationsByLocation(@RequestParam String location) {
        return withCacheControl(Permission.fromModel(permissionService.getUserPermissionByLocation(location)));
    }

    @PutMapping("/permissions")
    public Permission setAuthorization(@Valid @RequestBody Permission permission) {
        io.fairspace.neptune.model.Permission storedPermission =
                permissionService.authorize(permission.getSubject(), permission.getCollection(), permission.getAccess(), false);
        return Permission.fromModel(storedPermission);
    }

    private <T> ResponseEntity<T> withCacheControl(T body) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Integer.parseInt(cachePeriod), TimeUnit.SECONDS))
                .body(body);
    }
}
