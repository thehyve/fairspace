package io.fairspace.saturn.webdav;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.milton.config.HttpManagerBuilder;
import io.milton.event.ResponseEvent;
import io.milton.http.AuthenticationService;
import io.milton.http.HttpManager;
import io.milton.http.ProtocolHandlers;
import io.milton.http.ResourceFactory;
import io.milton.http.webdav.ResourceTypeHelper;
import io.milton.http.webdav.WebDavResponseHandler;
import io.milton.servlet.ServletRequest;
import io.milton.servlet.ServletResponse;
import org.apache.jena.rdf.model.Literal;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
import static io.milton.servlet.MiltonServlet.clearThreadlocals;
import static io.milton.servlet.MiltonServlet.setThreadlocals;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;

/**
 * Ensures that all operations are handled in one transaction.
 * Contents of PUT requests is received and saved to the blob store BEFORE transaction is started.
 * Contents of GET responses is sent AFTER transaction is ended.
 */
public class WebDAVServlet extends HttpServlet {
    private static final String BLOB_ATTRIBUTE = "BLOB";
    private static final String TIMESTAMP_ATTRIBUTE = "TIMESTAMP";

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
                setEnabledJson(false);
                setEnabledCkBrowser(false);
            }

            @Override
            protected void buildProtocolHandlers(WebDavResponseHandler webdavResponseHandler, ResourceTypeHelper resourceTypeHelper) {
                super.buildProtocolHandlers(webdavResponseHandler, resourceTypeHelper);

                setProtocolHandlers(new ProtocolHandlers(getProtocols()
                        .stream()
                        .map(p -> new TransactionalHttpExtensionWrapper(p, txn))
                        .collect(toList())));
            }
        }.buildHttpManager();

        httpManager.getEventManager().registerEventListener(new AuditEventListener(), ResponseEvent.class);
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            setThreadlocals(req, res);

            if (req.getMethod().equalsIgnoreCase("PUT")) {
                var blob = store.store(req.getInputStream());
                req.setAttribute(BLOB_ATTRIBUTE, blob);
            }

            httpManager.process(new ServletRequest(req, req.getServletContext()), new ServletResponse(res));
        } finally {
            clearThreadlocals();
            res.getOutputStream().flush();
            res.flushBuffer();
        }
    }


    static Integer fileVersion() {
        return Optional.ofNullable(getCurrentRequest())
                .map(r -> r.getHeader("Version"))
                .map(Integer::parseInt)
                .orElse(null);
    }

    static String owner() {
        return Optional.ofNullable(currentRequest.get())
                .map(r -> r.getHeader("Owner"))
                .orElse(null);
    }

    static boolean showDeleted() {
        return "on".equalsIgnoreCase(getCurrentRequest().getHeader("Show-Deleted"));
    }

    static BlobInfo getBlob() {
        return (BlobInfo) getCurrentRequest().getAttribute(BLOB_ATTRIBUTE);
    }

    static Literal timestampLiteral() {
        var r = getCurrentRequest();
        var t = (Literal) r.getAttribute(TIMESTAMP_ATTRIBUTE);
        if (t == null) {
            t = toXSDDateTimeLiteral(Instant.now());
            r.setAttribute(TIMESTAMP_ATTRIBUTE, t);
        }
        return t;
    }
}
