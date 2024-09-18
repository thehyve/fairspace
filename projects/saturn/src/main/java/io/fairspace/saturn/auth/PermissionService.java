package io.fairspace.saturn.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import io.fairspace.saturn.services.users.UserService;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final UserService userService;

    // todo: add tests
    public boolean hasMetadataQueryPermission() {
        var user = userService.currentUser();
        return user != null && user.isCanQueryMetadata();
    }
}
