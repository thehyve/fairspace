package io.fairspace.saturn.config;

import io.fairspace.saturn.services.users.*;
import lombok.*;
import lombok.extern.slf4j.*;
import org.apache.jena.fuseki.servlets.*;

import static org.apache.jena.fuseki.servlets.ServletOps.errorForbidden;

@Slf4j
public class Protected_SPARQL_QueryDataset extends SPARQL_QueryDataset {
    private final UserService userService;

    public Protected_SPARQL_QueryDataset(UserService userService) {
        this.userService = userService;
    }

    @SneakyThrows
    @Override
    protected void validateRequest(HttpAction action) {
        var user = userService.currentUser();
        if (user == null || !user.isCanQueryMetadata()) {
            log.error("The current user has no metadata querying role: {}", userService.currentUser().getName());
            errorForbidden("The current user has no metadata querying role");
        } else {
            super.validateRequest(action);
        }
    }
}
