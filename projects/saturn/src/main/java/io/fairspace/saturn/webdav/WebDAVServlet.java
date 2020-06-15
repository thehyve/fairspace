package io.fairspace.saturn.webdav;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.*;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.http.http11.CustomPostHandler;
import io.milton.http.webdav.ResourceTypeHelper;
import io.milton.http.webdav.WebDavResponseHandler;
import io.milton.resource.Resource;
import io.milton.servlet.ServletRequest;
import io.milton.servlet.ServletResponse;
import lombok.SneakyThrows;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.commons.io.input.MessageDigestCalculatingInputStream;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.currentRequest;
import static io.milton.servlet.MiltonServlet.*;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.apache.commons.codec.binary.Hex.encodeHexString;

public class WebDAVServlet extends HttpServlet {
    public static final String BLOB_ATTRIBUTE = "BLOB";

    private final HttpManager httpManager;
    private final BlobStore store;

    public WebDAVServlet(ResourceFactory factory, Transactions txn, BlobStore store) {
        this.store = store;

        httpManager = new HttpManagerBuilder() {
            {
                setResourceFactory(factory);
                setMultiNamespaceCustomPropertySourceEnabled(true);
                setAuthenticationService(new AuthenticationService(singletonList(new SaturnAuthenticationHandler())));
                setValueWriters(new NullSafeValueWriters());
           //     setHttp11ResponseHandler(new DefaultHttp11ResponseHandler(getAuthenticationService(), geteTagGenerator(), getContentGenerator()));
                setEnabledJson(false);
                setEnabledCkBrowser(false);
            }

            @Override
            protected void buildProtocolHandlers(WebDavResponseHandler webdavResponseHandler, ResourceTypeHelper resourceTypeHelper) {
                super.buildProtocolHandlers(webdavResponseHandler, resourceTypeHelper);
                setProtocolHandlers(new ProtocolHandlers(getProtocols()
                        .stream()
                        .map(p -> new HttpExtension() {
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
                        ).collect(toList())));
            }
        }.buildHttpManager();


        httpManager.addEventListener(new EventListener() {
            @Override
            public void onPost(Request request, Response response, Resource resource, Map<String, String> params, Map<String, FileItem> files) { }

            @Override
            public void onGet(Request request, Response response, Resource resource, Map<String, String> params) { }

            @Override
            public void onProcessResourceStart(Request request, Response response, Resource resource) { }

            @Override
            public void onProcessResourceFinish(Request request, Response response, Resource resource, long duration) {
                audit("FS_" + request.getMethod(), "resource", resource, "success", response.getStatus().code < 300);
            }
        });
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            setThreadlocals(req, res);

            if (req.getMethod().equalsIgnoreCase("PUT")) {
                var blob = write(req.getInputStream());
                req.setAttribute(BLOB_ATTRIBUTE, blob);
            }

            httpManager.process(new ServletRequest(req, req.getServletContext()), new ServletResponse(res));
        } finally {
            clearThreadlocals();
            res.getOutputStream().flush();
            res.flushBuffer();
        }
    }

    private BlobInfo write(InputStream in) throws IOException {
        try {
            var countingInputStream = new CountingInputStream(in);
            var messageDigestCalculatingInputStream = new MessageDigestCalculatingInputStream(countingInputStream);

            var id = store.write(messageDigestCalculatingInputStream);

            return new BlobInfo(id, countingInputStream.getByteCount(), encodeHexString(messageDigestCalculatingInputStream.getMessageDigest().digest()));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    static Integer fileVersion() {
        return Optional.ofNullable(currentRequest.get())
                .map(r -> r.getHeader("Version"))
                .map(Integer::parseInt)
                .orElse(null);
    }

    static boolean showDeleted() {
        return Optional.ofNullable(currentRequest.get())
                .map(r -> r.getHeader("Show-Deleted"))
                .map("on"::equalsIgnoreCase)
                .orElse(false);
    }

    static BlobInfo getBlob() {
        return Optional.ofNullable(currentRequest.get())
                .map(r -> (BlobInfo) r.getAttribute(BLOB_ATTRIBUTE))
                .orElse(null);
    }

    private static class TransactionalHandlerWrapper implements Handler {
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
        public void process(HttpManager httpManager, Request request, Response response) throws ConflictException, NotAuthorizedException, BadRequestException, NotFoundException {
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
}
