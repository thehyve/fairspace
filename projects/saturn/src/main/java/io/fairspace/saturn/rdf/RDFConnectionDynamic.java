package io.fairspace.saturn.rdf;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.rdfconnection.RDFConnectionWrapper;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;

public class RDFConnectionDynamic extends RDFConnectionWrapper {
    private final Config.Jena config;
    private final Supplier<OAuthAuthenticationToken> userInfoSupplier;
    private final ConcurrentHashMap<String, RDFConnection> connections = new ConcurrentHashMap<>();
    private final ThreadLocal<RDFConnection> current = new ThreadLocal<>();

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
        current.set(connections.computeIfAbsent(databaseName, this::connectOrCreate) );
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
}
