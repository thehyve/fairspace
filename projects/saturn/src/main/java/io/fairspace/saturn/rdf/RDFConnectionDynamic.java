package io.fairspace.saturn.rdf;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.rdfconnection.RDFConnectionWrapper;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.function.Supplier;

import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;

public class RDFConnectionDynamic extends RDFConnectionWrapper {
    private static final Duration INACTIVE_DATABASE_SHUTDOWN_INTERVAL_SEC = Duration.ofMinutes(30);

    private final Config.Jena config;
    private final Supplier<OAuthAuthenticationToken> userInfoSupplier;
    private final ThreadLocal<RDFConnection> current = new ThreadLocal<>();
    private final LoadingCache<String, RDFConnection> cache = CacheBuilder.newBuilder()
            .expireAfterAccess(INACTIVE_DATABASE_SHUTDOWN_INTERVAL_SEC)
            .removalListener(notification -> ((RDFConnection)notification.getValue()).close())
            .build(new CacheLoader<>() {
                public RDFConnection load(String databaseName) {
                    return connectOrCreate(databaseName);
                }
            });

    public RDFConnectionDynamic(Config.Jena config, Supplier<OAuthAuthenticationToken> userInfoSupplier) {
        super(null);

        this.config = config;
        this.userInfoSupplier = userInfoSupplier;
    }

    @Override
    protected RDFConnection get() {
        return current.get();
    }

    public void connect(String databaseName) {
        try {
            current.set(cache.get(databaseName));
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private RDFConnection connectOrCreate(String databaseName) {
        try {
            var rdf = new RDFConnectionLocal(SaturnDatasetFactory.connect(config, databaseName, userInfoSupplier), Isolation.COPY);
            initVocabularies(rdf);
            return rdf;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void close() {
        cache.cleanUp();
    }
}
