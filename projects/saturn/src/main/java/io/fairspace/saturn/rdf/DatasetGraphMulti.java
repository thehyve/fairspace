package io.fairspace.saturn.rdf;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.search.ElasticSearchClientFactory;
import io.fairspace.saturn.rdf.transactions.DatasetGraphWrapperJobSupport;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.util.Context;
import org.elasticsearch.client.Client;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static io.fairspace.saturn.ThreadContext.getThreadContext;

public class DatasetGraphMulti extends DatasetGraphWrapperJobSupport {
    private final LoadingCache<String, DatasetGraph> cache;
    private final Client client;

    public DatasetGraphMulti(Config config) {
        super(null);

        client = config.jena.elasticSearch.enabled
                ? ElasticSearchClientFactory.build(config.jena.elasticSearch.settings, config.jena.elasticSearch.advancedSettings)
                : null;

        cache = CacheBuilder.newBuilder()
                .expireAfterAccess(config.jena.inactiveConnectionShutdownIntervalSec, TimeUnit.SECONDS)
                .removalListener(notification -> ((DatasetGraph) notification.getValue()).close())
                .build(new CacheLoader<>() {
                    public DatasetGraph load(String workspaceName) throws Exception {
                        return SaturnDatasetFactory.connect(config, workspaceName, client);
                    }
                });
    }

    @Override
    protected DatasetGraph get() {
        try {
            return cache.get(getThreadContext().getWorkspace());
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Context getContext() {
        return Context.emptyContext;
    }

    @Override
    public void close() {
        cache.cleanUp();
        if (client != null) {
            client.close();
        }
    }

    @Override
    protected Context getCxt() {
        return super.getCxt();
    }

    @Override
    public boolean supportsTransactions() {
        return true;
    }

    @Override
    public boolean supportsTransactionAbort() {
        return true;
    }

    @Override
    public String toString() {
        return "Multi graph, current = " + getThreadContext().getWorkspace();
    }
}