package io.fairspace.saturn.services.users;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.services.BaseApp;

import static io.fairspace.saturn.auth.RequestContext.getIdTokenString;

import static jakarta.servlet.http.HttpServletResponse.SC_SEE_OTHER;
import static spark.Spark.get;

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
            var idToken = getIdTokenString();
            service.logoutCurrent();
            res.status(SC_SEE_OTHER);
            res.header(
                    "Location",
                    "%srealms/%s/protocol/openid-connect/logout?post_logout_redirect_uri=%s&id_token_hint=%s"
                            .formatted(config.auth.authServerUrl, config.auth.realm, config.publicUrl, idToken));
            return "";
        });
    }
}
