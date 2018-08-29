package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/")
public class AuthorizationController {
    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping("/{collectionId}/authorizations")
    public Object getCollectionPermissions(@PathVariable Long collectionId, @RequestParam(required = false) String user) {
        return (user != null)
                ? authorizationService.findByUserAndCollectionId(user, collectionId)
                : authorizationService.findByCollectionId(collectionId);
    }

    @GetMapping("/authorizations")
    public List<Authorization> getUserPermissions(@RequestParam @NotNull String user) {
        return authorizationService.findByUser(user);
    }


    @PutMapping("/authorizations")
    public Authorization addPermission(@RequestBody Authorization authorization) {
        return authorizationService.add(authorization);
    }
}
