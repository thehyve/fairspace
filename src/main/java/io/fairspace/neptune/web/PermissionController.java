package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
public class PermissionController {
    @Autowired
    private PermissionService permissionService;

    @GetMapping("/{collection}/permissions")
    public List<Permission> getCollectionAuthorizations(@PathVariable Long collectionId) {
        return permissionService.getByCollection(collectionId);
    }

    @PutMapping("/permissions")
    public Permission setAuthorization(@RequestBody Permission permission) {
        return permissionService.authorize(permission, false);
    }
}
