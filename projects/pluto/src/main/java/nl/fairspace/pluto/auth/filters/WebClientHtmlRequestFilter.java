package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.config.dto.AppSecurityUrlConfig;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import org.springframework.boot.web.reactive.filter.OrderedWebFilter;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;

import static nl.fairspace.pluto.auth.AuthorizationFailedHandler.XHR_VALUE;
import static nl.fairspace.pluto.auth.AuthorizationFailedHandler.X_REQUESTED_WITH_HEADER;

/**
 * This filter intercepts static content requests made by e.g. the client react router on refresh
 * and returns static resource index page.
 */
@Slf4j
@Component
public class WebClientHtmlRequestFilter implements OrderedWebFilter {

    private final AppSecurityUrlConfig urlConfig;
    private final PlutoConfig plutoConfig;
    private Resource indexFile;

    public WebClientHtmlRequestFilter(AppSecurityUrlConfig urlConfig, PlutoConfig plutoConfig) {
        this.urlConfig = urlConfig;
        this.plutoConfig = plutoConfig;
        String staticHtmlLocation = plutoConfig.getStaticHtmlLocation();
        if (staticHtmlLocation != null && !staticHtmlLocation.trim().isEmpty()) {
            indexFile = new FileSystemResource(Paths.get(staticHtmlLocation, "index.html"));
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (shouldRedirect(exchange.getRequest())) {
            ServerHttpResponse response = exchange.getResponse();
            response.getHeaders().put(HttpHeaders.CONTENT_TYPE, Collections.singletonList((MediaType.TEXT_HTML_VALUE)));
            String newResponseBody = "";
            if (indexFile != null) {
                try {
                    newResponseBody = indexFile.getContentAsString(StandardCharsets.UTF_8);
                } catch (Exception e) {
                    log.error("Error while reading static resource html file: " + e.getMessage());
                }
            }

            DataBuffer buffer = response.bufferFactory().wrap(newResponseBody.getBytes());
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            return exchange.getResponse().writeWith(Flux.just(buffer));
        }
        return chain.filter(exchange);
    }

    private boolean shouldRedirect(ServerHttpRequest request) {
        String acceptHeader = request.getHeaders().getFirst(HttpHeaders.ACCEPT);
        return HttpMethod.GET.matches(request.getMethod().name()) && acceptHeader != null &&
                acceptHeader.contains("text/html") &&
                !XHR_VALUE.equals(request.getHeaders().getFirst(X_REQUESTED_WITH_HEADER)) &&
                (Arrays.stream(this.urlConfig.getPermitAll()).noneMatch(url -> request.getPath().toString().startsWith(url) ||
                        request.getPath().toString().equals("/") || request.getPath().toString().equals(""))
                );
    }

    @Override
    public int getOrder() {
        return HIGHEST_PRECEDENCE;
    }
}
