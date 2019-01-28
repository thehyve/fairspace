package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.VirtualFileSystem;
import io.fairspace.saturn.webdav.vfs.contents.LocalImmutableVfsContentFactory;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentFactory;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import io.fairspace.saturn.webdav.vfs.resources.rdf.RdfBackedVfsResourceFactory;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.HttpManager;
import io.milton.http.Response;
import io.milton.servlet.MiltonServlet;
import io.milton.servlet.ServletRequest;
import io.milton.servlet.ServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdfconnection.RDFConnection;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

@Slf4j
public class MiltonWebDAVServlet extends HttpServlet {
    private ServletContext servletContext;

    private HttpManager httpManager;

    public MiltonWebDAVServlet(String basePath, RDFConnection connection) {
        // TODO: Use DI
        VfsResourceFactory resourceFactory = new RdfBackedVfsResourceFactory(connection);
        VfsContentFactory contentFactory = new LocalImmutableVfsContentFactory(new File("/tmp"));

        this.httpManager = setupHttpManager(basePath, resourceFactory, contentFactory);
    }

    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            this.servletContext = config.getServletContext();
        } catch (Throwable ex) {
            log.error("Exception starting Milton WebDAV servlet", ex);
            throw new RuntimeException(ex);
        }
    }

    @Override
    public void service(javax.servlet.ServletRequest servletRequest, javax.servlet.ServletResponse servletResponse) throws ServletException, IOException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse resp = (HttpServletResponse) servletResponse;

        try {
            MiltonServlet.setThreadlocals(req, resp);
            io.milton.http.Request request = new ServletRequest(req, servletContext);
            Response response = new ServletResponse(resp);
            httpManager.process(request, response);
        } finally {
            MiltonServlet.clearThreadlocals();
            servletResponse.getOutputStream().flush();
            servletResponse.flushBuffer();
        }
    }

    static HttpManager setupHttpManager(String basePath, VfsResourceFactory resourceFactory, VfsContentFactory contentFactory) {
        HttpManagerBuilder builder = new HttpManagerBuilder();
        builder.setResourceFactory(new VfsBackedMiltonResourceFactory(basePath, new VirtualFileSystem(contentFactory, resourceFactory)));
        builder.setEnableBasicAuth(false);
        return builder.buildHttpManager();
    }
}
