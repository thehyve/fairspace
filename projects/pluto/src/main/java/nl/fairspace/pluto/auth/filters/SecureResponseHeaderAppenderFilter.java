package nl.fairspace.pluto.auth.filters;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * This filter adds secure headers to the response in order to increase the security of the application.
 * Based on OWASP Secure Headers Project (https://owasp.org/www-project-secure-headers/).
 *
 * Relates to OWASP Top 10 2017, A6:2017-Security Misconfiguration
 * (https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration)
 *
 * Headers already included by default: "Strict-Transport-Security"
 */
@Component
public class SecureResponseHeaderAppenderFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    var headers = exchange.getResponse().getHeaders();
                    headers.add("X-Frame-Options", "DENY");
                    headers.add("X-Content-Type-Options", "nosniff");
                    headers.add("X-XSS-Protection", "0");
                    headers.add("X-Permitted-Cross-Domain-Policies", "none");
                    headers.add(
                            "Content-Security-Policy",
                            "default-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' 'unsafe-inline' https://*"
                    );
                }));
    }
}
