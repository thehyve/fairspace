package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/")
public class AuthorizationController {
    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping("/{collectionId}/authorization")
    public Object getCollectionPermission(@PathVariable Long collectionId, Principal principal) {
        return authorizationService.getUserAuthorization(collectionId, principal.getName());
    }

    @GetMapping("/{collectionId}/authorizations")
    public Object getCollectionPermissions(@PathVariable Long collectionId, Principal principal) {
        return authorizationService.getAllUsersAuthorizations(collectionId, principal.getName());
    }

    @PutMapping("/authorizations")
    public Authorization addPermission(@RequestBody Authorization authorization, Principal principal) {
        return authorizationService.add(authorization, principal.getName());
    }
}
