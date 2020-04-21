package io.fairspace.saturn.webdav;

import io.fairspace.saturn.config.Services;
import io.milton.config.HttpManagerBuilder;
import io.milton.http.Auth;
import io.milton.http.AuthenticationService;
import io.milton.http.HttpManager;
import io.milton.http.Response;
import io.milton.http.http11.DefaultHttp11ResponseHandler;
import io.milton.resource.Resource;
import io.milton.servlet.ServletRequest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;

import static io.milton.servlet.MiltonServlet.clearThreadlocals;
import static io.milton.servlet.MiltonServlet.setThreadlocals;
import static java.util.Collections.singletonList;

public class WebDAVServlet extends HttpServlet {
    private final HttpManager httpManager;

    public WebDAVServlet(Services svc) {
        httpManager =  new HttpManagerBuilder() {{
            setResourceFactory(new VfsBackedMiltonResourceFactory(svc.getFileSystem()));
            setMultiNamespaceCustomPropertySourceEnabled(true);
            setAuthenticationService(new AuthenticationService(singletonList(new SaturnAuthenticationHandler())));
            setValueWriters(new NullSafeValueWriters());

            setHttp11ResponseHandler(new DefaultHttp11ResponseHandler(getAuthenticationService(), geteTagGenerator(), getContentGenerator()) {
                // Doesn't send Accept-Ranges header
                @Override
                protected void setRespondCommonHeaders(Response response, Resource resource, Response.Status status, Auth auth) {
                    response.setStatus(status);
                    response.setDateHeader(new Date());
                    var etag = generateEtag(resource);
                    if (etag != null) {
                        response.setEtag(etag);
                    }
                }
            });
        }}.buildHttpManager();
    }

    @Override
    public void service(javax.servlet.ServletRequest servletRequest, javax.servlet.ServletResponse servletResponse) throws ServletException, IOException {
        var req = (HttpServletRequest) servletRequest;
        var res = (HttpServletResponse) servletResponse;

        try {
            setThreadlocals(req, res);
            httpManager.process(new ServletRequest(req, servletRequest.getServletContext()), new io.milton.servlet.ServletResponse(res));
        } finally {
            clearThreadlocals();
            servletResponse.getOutputStream().flush();
            servletResponse.flushBuffer();
        }
    }
}
