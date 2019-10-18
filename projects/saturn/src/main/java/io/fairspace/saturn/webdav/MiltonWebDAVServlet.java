package io.fairspace.saturn.webdav;


import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.config.HttpManagerBuilder;
import io.milton.event.RequestEvent;
import io.milton.http.*;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.http.http11.DefaultHttp11ResponseHandler;
import io.milton.http.http11.Http11ResponseHandler;
import io.milton.http.http11.PartialGetHelper;
import io.milton.resource.GetableResource;
import io.milton.resource.Resource;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import static io.milton.servlet.MiltonServlet.clearThreadlocals;
import static io.milton.servlet.MiltonServlet.setThreadlocals;
import static java.util.Collections.singletonList;

public class MiltonWebDAVServlet extends HttpServlet {
    private final HttpManager httpManager;

    public MiltonWebDAVServlet(String pathPrefix, VirtualFileSystem fs, Consumer<Request> requestEventListener) {
        httpManager = setupHttpManager(pathPrefix, fs, requestEventListener);
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

    static HttpManager setupHttpManager(String pathPrefix, VirtualFileSystem fs, Consumer<Request> requestEventListener) {
        return new HttpManagerBuilder() {{
            setResourceFactory(new VfsBackedMiltonResourceFactory(pathPrefix, fs));
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
            setPartialGetHelper(new PartialGetHelper() {
                @Override
                public void sendPartialContent(GetableResource resource, Request request, Response response, List<Range> ranges, Map<String, String> params, Http11ResponseHandler responseHandler) throws NotAuthorizedException, BadRequestException, IOException, NotFoundException {
                    // According to HTTP/1.1 standard, a server MAY ignore the Range header
                    responseHandler.respondContent(resource, response, request, params);
                }
            });

            if (requestEventListener != null) {
                eventManager.registerEventListener(e -> requestEventListener.accept(((RequestEvent) e).getRequest()), RequestEvent.class);
            }
        }}.buildHttpManager();
    }
}
