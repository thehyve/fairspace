package io.fairspace.neptune.web;

import io.fairspace.neptune.service.PermissionService;
import io.fairspace.neptune.web.dto.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
public class PermissionController {
    @Autowired
    private PermissionService permissionService;

    @GetMapping("/{collectionId}/permissions")
    public List<Permission> getCollectionAuthorizations(@PathVariable Long collectionId) {
        return permissionService.getByCollection(collectionId).stream()
                .map(Permission::fromModel)
                .collect(Collectors.toList());
    }

    @GetMapping("/permissions")
    public Permission getAuthorizationsByLocation(@RequestParam String location) {
        return Permission.fromModel(permissionService.getUserPermissionByLocation(location));
    }

    @PutMapping("/permissions")
    public Permission setAuthorization(@Valid @RequestBody Permission permission) {
        io.fairspace.neptune.model.Permission storedPermission =
                permissionService.authorize(permission.getSubject(), permission.getCollection(), permission.getAccess(), false);
        return Permission.fromModel(storedPermission);
    }
}
