package io.fairspace.saturn.services.account;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

import io.fairspace.saturn.services.BaseApp;

public class AccountApp extends BaseApp {
    public AccountApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(getThreadContext().getUser());
        });
    }
}
