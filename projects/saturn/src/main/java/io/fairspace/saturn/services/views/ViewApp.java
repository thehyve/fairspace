package io.fairspace.saturn.services.views;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.post;

public class ViewApp extends BaseApp {

    private final ViewService viewService;

    public ViewApp(String basePath, ViewService viewService) {
        super(basePath);
        this.viewService = viewService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(new ViewsDTO(viewService.getFacets(), viewService.getViews()));
        });

        post("/", (req, res) -> {
            var result = viewService.retrieveViewPage(mapper.readValue(req.body(), ViewRequest.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });

        post("/count", (req, res) -> {
            var result = viewService.getCount(mapper.readValue(req.body(), CountRequest.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });
    }
}