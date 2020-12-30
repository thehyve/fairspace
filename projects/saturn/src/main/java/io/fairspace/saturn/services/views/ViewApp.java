package io.fairspace.saturn.services.views;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.post;

public class ViewApp extends BaseApp {

    private final ViewService viewService;
    private final QueryService queryService;

    public ViewApp(String basePath, ViewService viewService, QueryService queryService) {
        super(basePath);
        this.viewService = viewService;
        this.queryService = queryService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(new ViewsDTO(viewService.getFacets(), viewService.getViews(), viewService.getResourcesView()));
        });

        post("/", (req, res) -> {
            var result = queryService.retrieveViewPage(mapper.readValue(req.body(), ViewRequest.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });

        post("/count", (req, res) -> {
            var result = queryService.count(mapper.readValue(req.body(), CountRequest.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });
    }
}
