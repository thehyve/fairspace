package io.fairspace.saturn.services.users;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

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
    }
}
