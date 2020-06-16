package io.fairspace.saturn.webdav;

import io.milton.http.Handler;
import io.milton.http.HttpExtension;
import io.milton.http.http11.CustomPostHandler;
import org.apache.jena.sparql.core.Transactional;

import java.util.List;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

class TransactionalHttpExtensionWrapper implements HttpExtension {
    private final HttpExtension p;
    private final Transactional txn;

    public TransactionalHttpExtensionWrapper(HttpExtension p, Transactional txn) {
        this.p = p;
        this.txn = txn;
    }

    @Override
    public Set<Handler> getHandlers() {
        return p.getHandlers()
                .stream()
                .map(h -> new TransactionalHandlerWrapper(h, txn))
                .collect(toSet());
    }

    @Override
    public List<CustomPostHandler> getCustomPostHandlers() {
        return p.getCustomPostHandlers();
    }
}
