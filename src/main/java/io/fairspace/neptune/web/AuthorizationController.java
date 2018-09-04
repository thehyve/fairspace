package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
public class AuthorizationController {
    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping("/{collectionId}/authorizations")
    public List<Authorization> getCollectionAuthorizations(@PathVariable Long collectionId) {
        return authorizationService.getByCollection(collectionId);
    }

    @PutMapping("/authorizations")
    public Authorization setAuthorization(@RequestBody Authorization authorization) {
        return authorizationService.authorize(authorization);
    }
}
