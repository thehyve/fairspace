package io.fairspace.saturn.webdav;

import java.util.List;
import java.util.Set;

import io.milton.http.Handler;
import io.milton.http.HttpExtension;
import io.milton.http.http11.CustomPostHandler;

import io.fairspace.saturn.rdf.transactions.Transactions;

import static java.util.stream.Collectors.toSet;

class TransactionalHttpExtensionWrapper implements HttpExtension {
    private final HttpExtension p;
    private final Transactions txn;

    public TransactionalHttpExtensionWrapper(HttpExtension p, Transactions txn) {
        this.p = p;
        this.txn = txn;
    }

    @Override
    public Set<Handler> getHandlers() {
        return p.getHandlers().stream()
                .map(h -> new TransactionalHandlerWrapper(h, txn))
                .collect(toSet());
    }

    @Override
    public List<CustomPostHandler> getCustomPostHandlers() {
        return p.getCustomPostHandlers();
    }
}
