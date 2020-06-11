package io.fairspace.saturn.webdav;

import io.fairspace.saturn.config.Services;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.AuthenticationService;
import io.milton.http.HttpManager;
import io.milton.http.http11.DefaultHttp11ResponseHandler;
import io.milton.servlet.ServletRequest;
import io.milton.servlet.ServletResponse;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.milton.servlet.MiltonServlet.*;
import static java.util.Collections.singletonList;

public class WebDAVServlet extends HttpServlet {
    private final HttpManager httpManager;

    public WebDAVServlet(Services svc) {
        httpManager = new HttpManagerBuilder() {{
            setResourceFactory(new VfsBackedMiltonResourceFactory(svc.getFileSystem()));
            setMultiNamespaceCustomPropertySourceEnabled(true);
            setAuthenticationService(new AuthenticationService(singletonList(new SaturnAuthenticationHandler())));
            setValueWriters(new NullSafeValueWriters());

            setHttp11ResponseHandler(new DefaultHttp11ResponseHandler(getAuthenticationService(), geteTagGenerator(), getContentGenerator()));
        }}.buildHttpManager();
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            setThreadlocals(req, res);
            httpManager.process(new ServletRequest(req, req.getServletContext()), new ServletResponse(res));
        } finally {
            clearThreadlocals();
            res.getOutputStream().flush();
            res.flushBuffer();
        }
    }

    static Integer versionHeader() {
        var header = request().getHeader("Version");
        return (header != null) ? Integer.parseInt(header) : null;
    }
}
