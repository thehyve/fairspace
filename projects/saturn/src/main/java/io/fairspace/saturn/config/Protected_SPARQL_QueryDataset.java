package io.fairspace.saturn.config;

import lombok.*;
import lombok.extern.slf4j.*;

import io.fairspace.saturn.services.users.*;

@Slf4j
public class Protected_SPARQL_QueryDataset {

    private final UserService userService;

    public Protected_SPARQL_QueryDataset(UserService userService) {
        this.userService = userService;
    }

    //    @SneakyThrows
    //    @Override
    // todo: bring this logic to spring security qith new SPARQL query
    //    protected void validateRequest(HttpAction action) {
    //        var user = userService.currentUser();
    //        if (user == null || !user.isCanQueryMetadata()) {
    //            log.error(
    //                    "The current user has no metadata querying role: {}",
    //                    userService.currentUser().getName());
    //            errorForbidden("The current user has no metadata querying role");
    //        } else {
    //            super.validateRequest(action);
    //        }
    //    }
}
