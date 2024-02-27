package io.fairspace.saturn.webdav;

import io.milton.http.Handler;
import io.milton.http.HttpManager;
import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.Resource;
import lombok.SneakyThrows;

import io.fairspace.saturn.rdf.transactions.Transactions;

class TransactionalHandlerWrapper implements Handler {
    private final Handler wrapped;
    private final Transactions txn;

    public TransactionalHandlerWrapper(Handler wrapped, Transactions txn) {
        this.wrapped = wrapped;
        this.txn = txn;
    }

    @Override
    public String[] getMethods() {
        return wrapped.getMethods();
    }

    @Override
    @SneakyThrows
    public void process(HttpManager httpManager, Request request, Response response)
            throws ConflictException, NotAuthorizedException, BadRequestException, NotFoundException {
        if (request.getMethod().isWrite) {
            txn.executeWrite(ds -> wrapped.process(httpManager, request, response));
        } else {
            txn.executeRead(ds -> wrapped.process(httpManager, request, response));
        }
    }

    @Override
    public boolean isCompatible(Resource res) {
        return wrapped.isCompatible(res);
    }
}
