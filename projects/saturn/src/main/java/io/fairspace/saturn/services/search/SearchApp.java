package io.fairspace.saturn.services.search;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.post;

public class SearchApp extends BaseApp {
    private final SearchService searchService;

    public SearchApp(String basePath, SearchService searchService) {
        super(basePath);
        this.searchService = searchService;
    }

    @Override
    protected void initApp() {
        post("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            var request = mapper.readValue(req.body(), SearchRequest.class);
            var results = searchService.getSearchResults(request);
            return mapper.writeValueAsString(results);
        });
    }
}
