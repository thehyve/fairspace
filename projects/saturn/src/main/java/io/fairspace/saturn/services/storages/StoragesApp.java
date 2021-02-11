package io.fairspace.saturn.services.storages;

import io.fairspace.saturn.config.Config.Storage;
import io.fairspace.saturn.services.BaseApp;
import java.util.List;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class StoragesApp extends BaseApp {
    private final List<Storage> storages;

    public StoragesApp(String basePath, List<Storage> storages) {
        super(basePath);
        this.storages = storages;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(storages);
        });
    }
}
