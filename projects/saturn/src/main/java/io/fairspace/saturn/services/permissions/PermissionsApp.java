package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.permissions.dto.PermissionDto;
import org.apache.jena.graph.Node;
import spark.Request;

import static io.fairspace.saturn.util.ValidationUtils.validate;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.put;

public class PermissionsApp extends BaseApp {
    private final PermissionsService permissionsService;

    public PermissionsApp(String basePath, PermissionsService permissionsService) {
        super(basePath);

        this.permissionsService = permissionsService;
    }

    @Override
    protected void initApp() {
        get("/", APPLICATION_JSON.asString(), (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            if (req.queryParams().contains("all")) {
                return mapper.writeValueAsString(permissionsService.getPermissionDtos(getIri(req)));
            }

            return mapper.writeValueAsString(permissionsService.getAccessDto(getIri(req)));
        });

        put("/", (req, res) -> {
            var dto = mapper.readValue(req.body(), PermissionDto.class);
            permissionsService.setPermission(getIri(req), dto.getUser(), dto.getAccess());
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(dto);
        });
    }

    private static Node getIri(Request request) {
        var iri = request.queryParams("iri");
        validate(iri != null, "Query parameter \"iri\" is mandatory");
        return createURI(iri);
    }
}
