package io.fairspace.saturn.services.maintenance;

import io.fairspace.saturn.config.ConfigLoader;
import io.fairspace.saturn.services.views.*;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.query.Dataset;

import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.*;

@Log4j2
public class MaintenanceService {
    private final ThreadPoolExecutor threadpool = new ThreadPoolExecutor(1, 1,
            0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<>());
    private final Dataset dataset;
    private final ViewStoreClientFactory viewStoreClientFactory;

    public MaintenanceService(@NonNull Dataset dataset, ViewStoreClientFactory viewStoreClientFactory) {
        this.dataset = dataset;
        this.viewStoreClientFactory = viewStoreClientFactory;
    }

    public boolean disabled() {
        return viewStoreClientFactory == null;
    }

    public boolean active() {
        return threadpool.getActiveCount() > 0;
    }

    public void startRecreateIndexTask() {
        if (disabled()) {
            throw new RuntimeException("Service not available");
        }
        if (active()) {
            log.info("Reindexing is already in progress.");
            throw new RuntimeException("Reindexing is already in progress.");
        }
        threadpool.submit(() -> {
            log.info("Start asynchronous reindexing task");
            recreateIndex();
        });
    }

    public void recreateIndex() {
        try (var viewStoreClient = viewStoreClientFactory.build();
             var viewUpdater = new ViewUpdater(viewStoreClient, dataset.asDatasetGraph())){
            var start = new Date().getTime();
            // Index entities
            for (var view : ConfigLoader.VIEWS_CONFIG.views) {
                viewUpdater.recreateIndexForView(viewStoreClient, view);
            }
            viewUpdater.commit();
            log.info("View index recreated in {}ms.", new Date().getTime() - start);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to recreate index", e);
        }
    }
}
