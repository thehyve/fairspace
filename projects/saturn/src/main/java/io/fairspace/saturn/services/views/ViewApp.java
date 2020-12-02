package io.fairspace.saturn.services.views;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListeningExecutorService;
import io.fairspace.saturn.services.BaseApp;

import java.util.concurrent.TimeUnit;

import static com.google.common.util.concurrent.MoreExecutors.listeningDecorator;
import static java.util.concurrent.Executors.newSingleThreadExecutor;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.post;

public class ViewApp extends BaseApp {
    private final ViewService viewService;
    private final ListeningExecutorService refresher = listeningDecorator(newSingleThreadExecutor());
    private final LoadingCache<Boolean, ViewsDTO> viewsCache = CacheBuilder.newBuilder()
            .refreshAfterWrite(30, TimeUnit.SECONDS)
            .build(new CacheLoader<>() {
                @Override
                public ViewsDTO load(Boolean key) {
                    return new ViewsDTO(viewService.getFacets(), viewService.getViews());
                }

                @Override
                public ListenableFuture<ViewsDTO> reload(Boolean key, ViewsDTO oldValue) {
                    return refresher.submit(() -> load(false));
                }
            });
    public ViewApp(String basePath, ViewService viewService) {
        super(basePath);
        this.viewService = viewService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(viewsCache.get(false));
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