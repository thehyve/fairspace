package io.fairspace.saturn.services.users;

import io.fairspace.saturn.services.BaseApp;

import static io.fairspace.saturn.services.users.User.getCurrentUser;
import static javax.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.post;

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

        get("/current", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(getCurrentUser());
        });

        post("/current/logout", (req, res) -> {
            service.logoutCurrent(req.raw(), getCurrentUser());
            res.status(SC_NO_CONTENT);
            return "";
        });
    }
}
