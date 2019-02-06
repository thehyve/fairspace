package io.fairspace.saturn.webdav;


import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.HttpManager;
import io.milton.servlet.ServletRequest;
import io.milton.servlet.ServletResponse;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.milton.servlet.MiltonServlet.clearThreadlocals;
import static io.milton.servlet.MiltonServlet.setThreadlocals;

public class MiltonWebDAVServlet extends HttpServlet {
    private final HttpManager httpManager;
    private ServletContext servletContext;


    public MiltonWebDAVServlet(VirtualFileSystem fs) {
        httpManager = setupHttpManager(fs);
    }

    @Override
    public void service(javax.servlet.ServletRequest servletRequest, javax.servlet.ServletResponse servletResponse) throws ServletException, IOException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse resp = (HttpServletResponse) servletResponse;

        try {
            setThreadlocals(req, resp);
            io.milton.http.Request request = new ServletRequest(req, servletContext);
            io.milton.http.Response response = new ServletResponse(resp);
            httpManager.process(request, response);
        } finally {
            clearThreadlocals();
            servletResponse.getOutputStream().flush();
            servletResponse.flushBuffer();
        }
    }

    @Override
    public void init(ServletConfig config) throws ServletException {
        this.servletContext = config.getServletContext();
    }

    private static HttpManager setupHttpManager(VirtualFileSystem fs) {
        HttpManagerBuilder builder = new HttpManagerBuilder();
        builder.setResourceFactory(new VfsBackedMiltonResourceFactory(fs));
        builder.setEnableBasicAuth(false);
        return builder.buildHttpManager();
    }
}
