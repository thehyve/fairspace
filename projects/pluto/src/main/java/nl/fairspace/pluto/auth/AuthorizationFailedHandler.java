package nl.fairspace.pluto.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.Optional;

import static org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR;

@Slf4j
public class AuthorizationFailedHandler {
    public static final String WWW_AUTHENTICATE_HEADER = "WWW-Authenticate";
    public static final String BEARER_AUTH = "Bearer";
    public static final String BASIC_AUTH = "Basic realm=\"Fairspace\"";
    public static final String X_REQUESTED_WITH_HEADER = "X-Requested-With";
    public static final String XHR_VALUE = "XMLHttpRequest";
    public static final String LOGIN_PATH = "/login";
    public static final String LOGIN_PATH_HEADER = "X-Login-Path";
    public static final String STATIC_PATH = "/static/";

    public ServerWebExchange handleFailedAuthorization(ServerWebExchange exchange) {
        log.trace("Authentication failed for request {}", exchange.getRequest().getURI());

        if (shouldRedirect(exchange.getRequest())) {
            URI originalRequestUri = exchange.getRequest().getURI();
            URI redirectURI = UriComponentsBuilder.fromUri(originalRequestUri).replacePath(LOGIN_PATH).build().toUri();
            Optional<WebSession> session = exchange.getSession().blockOptional(Duration.ofMillis(500));
            if (session.isPresent()) {
                session.get().getAttributes().put(AuthConstants.PREVIOUS_REQUEST_SESSION_ATTRIBUTE, exchange.getRequest().getURI().toString());
                session.get().save();
            }
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate().uri(redirectURI).build();
            ServerWebExchange modifiedExchange = exchange.mutate().request(modifiedRequest).build();
            modifiedExchange.getAttributes().put(GATEWAY_REQUEST_URL_ATTR, redirectURI);
            modifiedExchange.getResponse().getHeaders().set(HttpHeaders.LOCATION, redirectURI.toString());
            modifiedExchange.getResponse().setStatusCode(HttpStatus.FOUND);
            return modifiedExchange;
        } else {
            exchange.getResponse().getHeaders().add(LOGIN_PATH_HEADER, LOGIN_PATH);
            exchange.getResponse().getHeaders().add(WWW_AUTHENTICATE_HEADER, BEARER_AUTH);
            if (!XHR_VALUE.equals(exchange.getRequest().getHeaders().getFirst(X_REQUESTED_WITH_HEADER)) && !isStaticResourceRequest(exchange.getRequest())) {
                exchange.getResponse().getHeaders().add(WWW_AUTHENTICATE_HEADER, BASIC_AUTH);
            }
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange;
        }
    }

    private boolean shouldRedirect(ServerHttpRequest request) {
        String acceptHeader = request.getHeaders().getFirst(HttpHeaders.ACCEPT);
        return HttpMethod.GET.matches(request.getMethod().name()) && acceptHeader != null &&
                acceptHeader.contains("text/html") &&
                !XHR_VALUE.equals(request.getHeaders().getFirst(X_REQUESTED_WITH_HEADER));
    }

    private boolean isStaticResourceRequest(ServerHttpRequest request) {
        return request.getURI().getPath().startsWith(STATIC_PATH);
    }
}
