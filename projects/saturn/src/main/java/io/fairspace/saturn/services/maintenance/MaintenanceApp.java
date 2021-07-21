package io.fairspace.saturn.services.maintenance;

import io.fairspace.saturn.services.BaseApp;

import static javax.servlet.http.HttpServletResponse.SC_OK;
import static javax.servlet.http.HttpServletResponse.SC_SERVICE_UNAVAILABLE;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class MaintenanceApp extends BaseApp {
    private final MaintenanceService maintenanceService;

    public MaintenanceApp(String basePath, MaintenanceService maintenanceService) {
        super(basePath);

        this.maintenanceService = maintenanceService;
    }

    @Override
    protected void initApp() {
        get("/resetpostgres", (req, res) -> {
            if (!maintenanceService.available()) {
                res.status(SC_SERVICE_UNAVAILABLE);
                return null;
            }
            res.type(APPLICATION_JSON.asString());
            var result = maintenanceService.resetPostgres();
            return mapper.writeValueAsString(result);
        });

        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            res.status(SC_OK);
            return "{}";
        });
    }
}
