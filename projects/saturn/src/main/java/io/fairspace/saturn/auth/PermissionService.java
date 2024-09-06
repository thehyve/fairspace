package io.fairspace.saturn.auth;

import io.fairspace.saturn.services.users.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
