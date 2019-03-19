package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.services.BaseApp;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import spark.Request;

import static io.fairspace.saturn.util.ValidationUtils.validate;
import static org.apache.jena.graph.NodeFactory.createURI;
import static spark.Spark.*;

@AllArgsConstructor
public class PermissionsApp extends BaseApp {
    private final PermissionsService permissionsService;

    @Override
    public void init() {
        super.init();

        path("/api/permissions", () -> {
            get("/", (req, res) -> {
                if (req.queryParams().contains("all")) {
                    return mapper.writeValueAsString(permissionsService.getPermissions(getIri(req))
                            .entrySet()
                            .stream()
                            .map(e -> new PermissionDto(e.getKey(), e.getValue())));
                }

                return mapper.writeValueAsString(new ValueDto<>(permissionsService.getPermission(getIri(req))));
            });

            put("/", (req, res) -> {
                var dto = mapper.readValue(req.body(), PermissionDto.class);
                permissionsService.setPermission(getIri(req), dto.getUser(), dto.getAccess());
                return "";
            });

            path("/readonly/", () -> {
                get("/", (req, res) ->
                        mapper.writeValueAsString(new ValueDto<>(permissionsService.isWriteRestricted(getIri(req)))));

                put("/", (req, res) -> {
                    permissionsService.setWriteRestricted(getIri(req), (Boolean) mapper.readValue(req.body(), ValueDto.class).getValue());
                    return "";
                });
            });
        });
    }

    private static Node getIri(Request request) {
        var param = request.queryParams("iri");
        validate(param != null, "Query parameter \"iri\" is mandatory");
        return createURI(param);
    }
}
