package io.fairspace.oidc_auth.bearer_auth.filters;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 101)
public class HeaderAuthenticationFilter implements Filter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    private JwtTokenValidator jwtTokenValidator;

    @Autowired
    public HeaderAuthenticationFilter(JwtTokenValidator jwtTokenValidator) {
        this.jwtTokenValidator = jwtTokenValidator;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // If the authorization is already set, skip this filter
        if(request.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
            chain.doFilter(request, response);
            return;
        }

        // Otherwise, check if the authorization can be found in the header
        OAuthAuthenticationToken authenticationToken = retrieveHeaderAuthorization((HttpServletRequest) request, (HttpServletResponse) response);

        log.trace("Retrieved authentication token from request: {}", authenticationToken);

        if(authenticationToken != null) {
            request.setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
        }

        chain.doFilter(request, response);
    }

    private OAuthAuthenticationToken retrieveHeaderAuthorization(HttpServletRequest request, HttpServletResponse response) {
        log.debug("Check authentication header for " + request.getPathInfo());

        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

        if(authorizationHeader == null) {
            log.debug("No Authorization header provided");
            return null;
        }

        if(!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.debug("Authorization header does not contain a Bearer token");
            return null;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token);

        if(claims != null) {
            log.debug("Valid JWT provided in Authorization header.");
            return new OAuthAuthenticationToken(token, claims);
        } else {
            log.debug("JWT provided in Authorization header is not valid. It may have expired.");
            return null;
        }
    }

    @Override
    public void destroy() {

    }
}
