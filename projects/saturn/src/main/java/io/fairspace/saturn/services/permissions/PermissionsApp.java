package io.fairspace.saturn.services.permissions;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.services.IRIModule;
import lombok.AllArgsConstructor;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.util.ValidationUtils.validate;
import static org.apache.jena.graph.NodeFactory.createURI;
import static spark.Spark.*;

@AllArgsConstructor
public class PermissionsApp implements SparkApplication {
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new IRIModule());

    private final PermissionsService permissionsService;

    @Override
    public void init() {
        path("api/permissions", () -> {
            get("/", (req, res) -> {
                validate(req.queryParams("iri") != null, "Query parameter \"iri\" is mandatory");
                var iri = createURI( req.queryParams("iri"));

                if (req.queryParams("user") != null) {
                    return permissionsService.getPermission(iri, createURI(req.queryParams("iri")));
                }

                if (req.queryParams().contains("all")) {
                    return permissionsService.getPermissions(iri);
                }

                return permissionsService.getPermission(iri);
            });

            put("/", (req, res) -> {
                var dto = mapper.readValue(req.body(), PermissionDto.class);
                permissionsService.setPermission(dto.getResource(), dto.getUser(), dto.getAccess());
                return "";
            });

        });
    }
}
