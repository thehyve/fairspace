package io.fairspace.saturn.services.users;

import io.fairspace.saturn.services.BaseApp;

import static jakarta.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

public class UserApp extends BaseApp {
    private final UserService service;

    public UserApp(String basePath, UserService service) {
        super(basePath);
        this.service = service;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(service.getUsers());
        });

        patch("/", (req, res) -> {
            service.update(mapper.readValue(req.body(), UserRolesUpdate.class));
            res.status(SC_NO_CONTENT);
            return "";
        });

        get("/current", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            var user = service.currentUser();
            return mapper.writeValueAsString(user);
        });
    }
}
