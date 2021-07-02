package io.fairspace.saturn.services.search;

import io.fairspace.saturn.services.BaseApp;
import io.fairspace.saturn.services.views.QueryService;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.post;

public class SearchApp extends BaseApp {
    private final SearchService searchService;
    private final QueryService queryService;

    public SearchApp(String basePath, SearchService searchService, QueryService queryService) {
        super(basePath);
        this.searchService = searchService;
        this.queryService= queryService;
    }

    @Override
    protected void initApp() {
        post("/files", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            var request = mapper.readValue(req.body(), FileSearchRequest.class);
            var searchResult = queryService.searchFiles(request);

            SearchResultsDTO resultDto = SearchResultsDTO.builder()
                    .results(searchResult)
                    .query(request.getQuery())
                    .build();

            return mapper.writeValueAsString(resultDto);
        });

        post("/lookup", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            var request = mapper.readValue(req.body(), LookupSearchRequest.class);
            var results = searchService.getLookupSearchResults(request);
            return mapper.writeValueAsString(results);
        });
    }
}
