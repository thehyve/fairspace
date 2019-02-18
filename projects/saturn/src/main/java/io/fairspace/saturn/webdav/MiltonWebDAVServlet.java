package io.fairspace.saturn.webdav;


import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.HttpManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.milton.servlet.MiltonServlet.clearThreadlocals;
import static io.milton.servlet.MiltonServlet.setThreadlocals;
import static java.util.Collections.singletonList;

public class MiltonWebDAVServlet extends HttpServlet {
    private final HttpManager httpManager;

    public MiltonWebDAVServlet(VirtualFileSystem fs) {
        httpManager = setupHttpManager(fs);
    }

    @Override
    public void service(javax.servlet.ServletRequest servletRequest, javax.servlet.ServletResponse servletResponse) throws ServletException, IOException {
        var req = (HttpServletRequest) servletRequest;
        var resp = (HttpServletResponse) servletResponse;

        try {
            setThreadlocals(req, resp);
            var request = new io.milton.servlet.ServletRequest(req, req.getServletContext());
            var response = new io.milton.servlet.ServletResponse(resp);
            httpManager.process(request, response);
        } finally {
            clearThreadlocals();
            servletResponse.getOutputStream().flush();
            servletResponse.flushBuffer();
        }
    }

    private static HttpManager setupHttpManager(VirtualFileSystem fs) {
        return new HttpManagerBuilder() {{
            setResourceFactory(new VfsBackedMiltonResourceFactory(fs));
            setMultiNamespaceCustomPropertySourceEnabled(true);
            setAuthenticationHandlers(singletonList(new SaturnAuthenticationHandler()));
        }}.buildHttpManager();
    }
}
