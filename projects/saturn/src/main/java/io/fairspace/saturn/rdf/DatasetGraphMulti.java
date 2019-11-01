package io.fairspace.saturn.rdf;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphWrapper;
import org.apache.jena.sparql.util.Context;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

public class DatasetGraphMulti extends DatasetGraphWrapper {
    private final Config.Jena config;
    private final Supplier<OAuthAuthenticationToken> userInfoSupplier;
    private final ThreadLocal<DatasetGraph> current = new ThreadLocal<>();
    private final LoadingCache<String, DatasetGraph> cache;

    public DatasetGraphMulti(Config.Jena config, Supplier<OAuthAuthenticationToken> userInfoSupplier) {
        super(null);
        this.config = config;
        this.userInfoSupplier = userInfoSupplier;
        cache = CacheBuilder.newBuilder()
                .expireAfterAccess(config.inactiveDatabaseShutdownIntervalSec, TimeUnit.SECONDS)
                .removalListener(notification -> ((DatasetGraph)notification.getValue()).close())
                .build(new CacheLoader<>() {
                    public DatasetGraph load(String databaseName) {
                        return connectOrCreate(databaseName);
                    }
                });
    }

    @Override
    protected DatasetGraph get() {
        return current.get();
    }

    @Override
    public Context getContext() {
        return Context.emptyContext;
    }

    public void connect(String databaseName) {
        try {
            current.set(databaseName != null ? cache.get(databaseName) : null);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private DatasetGraph connectOrCreate(String databaseName) {
        try {
            return SaturnDatasetFactory.connect(config, databaseName, userInfoSupplier);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void close() {
        cache.cleanUp();
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
        return "Multi graph, current = " + current.get();
    }
}
