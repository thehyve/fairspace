package io.fairspace.saturn.services.maintenance;

import io.fairspace.saturn.services.BaseApp;

import static jakarta.servlet.http.HttpServletResponse.*;
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
    }
}
