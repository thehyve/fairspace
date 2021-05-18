package io.fairspace.saturn.services.users;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.services.*;

import static javax.servlet.http.HttpServletResponse.*;
import static spark.Spark.*;

public class LogoutApp extends BaseApp {
    private final UserService service;
    private final Config config;

    public LogoutApp(String basePath, UserService service, Config config) {
        super(basePath);
        this.service = service;
        this.config = config;
    }

    @Override
    protected void initApp() {
        get("", (req, res) -> {
            service.logoutCurrent();
            res.status(SC_SEE_OTHER);
            res.header("Location", "%srealms/%s/protocol/openid-connect/logout?redirect_uri=%s".formatted(
                    config.auth.authServerUrl,
                    config.auth.realm,
                    config.publicUrl
                    )
            );
            return "";
        });
    }
}
