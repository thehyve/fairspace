package nl.fairspace.pluto.app.config;

import org.apache.http.HttpRequest;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.springframework.cloud.commons.httpclient.ApacheHttpClientConnectionManagerFactory;
import org.springframework.cloud.commons.httpclient.ApacheHttpClientFactory;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.cloud.netflix.zuul.filters.ZuulProperties;
import org.springframework.cloud.netflix.zuul.filters.route.SimpleHostRoutingFilter;
import org.springframework.util.MultiValueMap;

import javax.servlet.http.HttpServletRequest;

/**
 * Forwards request body regardless of HTTP method
 */
public class WebDAVHostRoutingFilter extends SimpleHostRoutingFilter {
    public WebDAVHostRoutingFilter(ProxyRequestHelper helper, ZuulProperties properties, ApacheHttpClientConnectionManagerFactory connectionManagerFactory, ApacheHttpClientFactory httpClientFactory) {
        super(helper, properties, connectionManagerFactory, httpClientFactory);
    }

    public WebDAVHostRoutingFilter(ProxyRequestHelper helper, ZuulProperties properties, CloseableHttpClient httpClient) {
        super(helper, properties, httpClient);
    }

    @Override
    protected HttpRequest buildHttpRequest(String verb, String uri, InputStreamEntity entity, MultiValueMap<String, String> headers, MultiValueMap<String, String> params, HttpServletRequest request) {
        var req = super.buildHttpRequest(verb, uri, entity, headers, params, request);

        if (!(req instanceof HttpEntityEnclosingRequestBase)) {
            var entityRequest = new BasicHttpEntityEnclosingRequest(verb, req.getRequestLine().getUri());
            entityRequest.setEntity(entity);
            entityRequest.setHeaders(req.getAllHeaders());
            req = entityRequest;
        }

        return req;
    }
}
