package nl.fairspace.pluto.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD;

/**
 * This class overrides the {@link DefaultCorsProcessor} implementation in
 * such a way that it allows not only standard HTTP methods, but also all HTTP
 * methods that are use in WebDAV. See {@link ExtendedHttpMethod} for the list of
 * methods.
 *
 * Please note that this implementation explicitly allows all methods, regardless of
 * the methods specified in the configuration.
 */
@Slf4j
public class AllowWebDavCorsProcessor extends DefaultCorsProcessor {
    @Override
    protected boolean handleInternal(ServerHttpRequest request, ServerHttpResponse response, CorsConfiguration config, boolean preFlightRequest) throws IOException {
        log.trace("Handle cors request for {} {}", request.getMethodValue(), request.getURI());

        String requestOrigin = request.getHeaders().getOrigin();
        String allowOrigin = checkOrigin(config, requestOrigin);
        HttpHeaders responseHeaders = response.getHeaders();

        responseHeaders.addAll(HttpHeaders.VARY, Arrays.asList(HttpHeaders.ORIGIN,
                ACCESS_CONTROL_REQUEST_METHOD, HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS));

        if (allowOrigin == null) {
            log.debug("Rejecting CORS request because '" + requestOrigin + "' origin is not allowed");
            rejectRequest(response);
            return false;
        }

        ExtendedHttpMethod requestMethod = getMethodToUse(request, preFlightRequest);
        List<String> allowMethods = checkMethods(config, requestMethod);
        if (allowMethods == null) {
            log.debug("Rejecting CORS request because '" + requestMethod + "' request method is not allowed");
            rejectRequest(response);
            return false;
        }

        List<String> requestHeaders = getHeadersToUse(request, preFlightRequest);
        List<String> allowHeaders = checkHeaders(config, requestHeaders);
        if (preFlightRequest && allowHeaders == null) {
            log.debug("Rejecting CORS request because '" + requestHeaders + "' request headers are not allowed");
            rejectRequest(response);
            return false;
        }

        responseHeaders.setAccessControlAllowOrigin(allowOrigin);

        if (preFlightRequest) {
            responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, StringUtils.collectionToCommaDelimitedString(allowMethods));
        }

        if (preFlightRequest && !allowHeaders.isEmpty()) {
            responseHeaders.setAccessControlAllowHeaders(allowHeaders);
        }

        if (!CollectionUtils.isEmpty(config.getExposedHeaders())) {
            responseHeaders.setAccessControlExposeHeaders(config.getExposedHeaders());
        }

        if (Boolean.TRUE.equals(config.getAllowCredentials())) {
            responseHeaders.setAccessControlAllowCredentials(true);
        }

        if (preFlightRequest && config.getMaxAge() != null) {
            responseHeaders.setAccessControlMaxAge(config.getMaxAge());
        }

        response.flush();
        return true;
    }

    private List<String> getHeadersToUse(ServerHttpRequest request, boolean isPreFlight) {
        HttpHeaders headers = request.getHeaders();
        return (isPreFlight ? headers.getAccessControlRequestHeaders() : new ArrayList<>(headers.keySet()));
    }


    /**
     * Check the HTTP method and determine the methods for the response of a
     * pre-flight request. The default implementation simply delegates to
     * {@link org.springframework.web.cors.CorsConfiguration#checkOrigin(String)}.
     */
    @Nullable
    protected List<String> checkMethods(CorsConfiguration config, @Nullable ExtendedHttpMethod requestMethod) {
        if(requestMethod == null) {
            return null;
        }

        return Collections.singletonList(requestMethod.toString());
    }

    @Nullable
    private ExtendedHttpMethod getMethodToUse(ServerHttpRequest request, boolean isPreFlight) {
        return ExtendedHttpMethod.valueOf((isPreFlight ? request.getHeaders().getFirst(ACCESS_CONTROL_REQUEST_METHOD) : request.getMethodValue()));
    }

}
