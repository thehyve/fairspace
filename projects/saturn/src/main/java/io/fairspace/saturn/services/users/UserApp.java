package io.fairspace.saturn.services.users;

import io.fairspace.saturn.services.BaseApp;

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

        put("/", (req, res) -> {
            var template = mapper.readValue(req.body(), User.class);
            var result = service.addUser(template);
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });

        patch("/", (req, res) -> {
            var template = mapper.readValue(req.body(), User.class);
            var result = service.updateUser(template);
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });

        get("/current/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(service.getCurrentUser());
        });
    }
}
