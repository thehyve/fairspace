package io.fairspace.saturn.services.views;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListeningExecutorService;
import io.fairspace.saturn.services.BaseApp;
import lombok.SneakyThrows;
import org.apache.jena.query.QueryCancelledException;
import org.eclipse.jetty.server.HttpOutput;
import spark.Response;

import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.google.common.util.concurrent.MoreExecutors.listeningDecorator;
import static java.util.concurrent.Executors.newSingleThreadExecutor;
import static java.util.concurrent.Executors.newSingleThreadScheduledExecutor;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

public class ViewApp extends BaseApp {
    private final ViewService viewService;
    private final ScheduledExecutorService checker = newSingleThreadScheduledExecutor();
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
            var cancellable = viewService.retrieveViewPage(mapper.readValue(req.body(), ViewRequest.class));
            var task = checker.scheduleWithFixedDelay(new CancellationCheck(res, cancellable), 0, 10, TimeUnit.MILLISECONDS);
            try {
                var result = cancellable.get(); // never throws QueryCancelledException
                if (isClosed(res)) {
                    halt();
                }
                res.type(APPLICATION_JSON.asString());
                return mapper.writeValueAsString(result);
            } finally {
                task.cancel(false);
            }
        });

        post("/count", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            var cancellable = viewService.getCount(mapper.readValue(req.body(), CountRequest.class));
            var task = checker.scheduleWithFixedDelay(new CancellationCheck(res, cancellable), 0, 10, TimeUnit.MILLISECONDS);
            try {
                var result = cancellable.get();
                return mapper.writeValueAsString(new CountDTO(result, false));
            } catch (QueryCancelledException e) {
                if (isClosed(res)) {
                    halt();
                }
                return mapper.writeValueAsString(new CountDTO(0, true));
            } finally {
                task.cancel(false);
            }
        });
    }

    // Should be thread-safe
    @SneakyThrows
    private static boolean isClosed(Response response) {
        return ((HttpOutput) response.raw().getOutputStream()).isClosed();
    }

    private static class CancellationCheck implements Runnable {
        private final Response response;
        private final ViewService.Cancellable<?> cancellable;

        private CancellationCheck(Response response, ViewService.Cancellable<?> cancellable) {
            this.response = response;
            this.cancellable = cancellable;
        }

        @Override
        public void run() {
            if (isClosed(response)) {
                cancellable.cancel();
            }
        }
    }
}