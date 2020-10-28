package io.fairspace.saturn.services.views;

import io.fairspace.saturn.services.*;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.post;

public class ViewApp extends BaseApp {

    final ViewService viewService;

    public ViewApp(String basePath, ViewService viewService) {
        super(basePath);
        this.viewService = viewService;
    }

    @Override
    protected void initApp() {
        post("/", (req, res) -> {
            var result = viewService.retrieveViewPage(
                    mapper.readValue(req.body(), ViewRequest.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });
    }
}
