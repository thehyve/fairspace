package io.fairspace.saturn.services.maintenance;

import io.fairspace.saturn.services.BaseApp;

import static javax.servlet.http.HttpServletResponse.*;
import static spark.Spark.get;
import static spark.Spark.post;

public class MaintenanceApp extends BaseApp {
    private final MaintenanceService maintenanceService;

    public MaintenanceApp(String basePath, MaintenanceService maintenanceService) {
        super(basePath);

        this.maintenanceService = maintenanceService;
    }

    @Override
    protected void initApp() {
        post("/reindex", (req, res) -> {
            maintenanceService.startRecreateIndexTask();
            res.status(SC_NO_CONTENT);
            return "";
        });
        post("/compact", (req, res) -> {
            maintenanceService.compactRdfStorageTask();
            res.status(SC_NO_CONTENT);
            return "";
        });
        get("/status", (req, res) -> {
            res.status(SC_OK);
            return maintenanceService.active() ? "active" : "inactive";
        });
    }
}
