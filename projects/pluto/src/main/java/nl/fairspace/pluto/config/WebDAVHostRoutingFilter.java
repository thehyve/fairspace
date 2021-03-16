package nl.fairspace.pluto.config;

import nl.fairspace.pluto.auth.model.*;
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
import java.util.stream.Stream;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

/**
 * Forwards request body regardless of HTTP method
 */
public class WebDAVHostRoutingFilter extends SimpleHostRoutingFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    public WebDAVHostRoutingFilter(ProxyRequestHelper helper, ZuulProperties properties, ApacheHttpClientConnectionManagerFactory connectionManagerFactory, ApacheHttpClientFactory httpClientFactory) {
        super(helper, properties, connectionManagerFactory, httpClientFactory);
    }

    public WebDAVHostRoutingFilter(ProxyRequestHelper helper, ZuulProperties properties, CloseableHttpClient httpClient) {
        super(helper, properties, httpClient);
    }

    @Override
    protected HttpRequest buildHttpRequest(String verb, String uri, InputStreamEntity entity, MultiValueMap<String, String> headers, MultiValueMap<String, String> params, HttpServletRequest request) {
        var req = super.buildHttpRequest(verb, uri, entity, headers, params, request);

        var token = (OAuthAuthenticationToken)request.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        if (token == null) {
            var session = request.getSession();
            if (session != null) {
                token = (OAuthAuthenticationToken) session.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
            }
        }
        if (token != null) {
            req.removeHeaders(AUTHORIZATION_HEADER);
            req.addHeader(AUTHORIZATION_HEADER, BEARER_PREFIX + token.getAccessToken());
        }

        if (!(req instanceof HttpEntityEnclosingRequestBase)
                && Stream.of(ExtendedHttpMethod.values()).anyMatch(method ->
                method.name().equalsIgnoreCase(verb) && method.isWebDAVSpecific())) {
            var entityRequest = new BasicHttpEntityEnclosingRequest(verb, req.getRequestLine().getUri());
            entityRequest.setEntity(entity);
            entityRequest.setHeaders(req.getAllHeaders());
            req = entityRequest;
        }

        return req;
    }
}
