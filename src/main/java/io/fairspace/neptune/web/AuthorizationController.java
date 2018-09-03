package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/")
public class AuthorizationController {
    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping("/{collectionId}/authorizations")
    public List<Authorization> getCollectionPermissions(@PathVariable Long collectionId) {
        return authorizationService.getAuthorizations(collectionId);
    }

    @PutMapping("/authorizations")
    public Authorization addPermission(@RequestBody Authorization authorization, Principal principal) {
        return authorizationService.add(authorization, principal.getName());
    }
}
