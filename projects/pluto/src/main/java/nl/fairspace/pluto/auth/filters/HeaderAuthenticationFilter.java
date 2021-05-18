package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;

/**
 * This filter extracts the token from a provided HTTP Authorization header.
 *
 * If a token is found, it is parsed and validated. If the token is valid (according to the
 * given validator), the extracted token is stored on the request in an attribute called
 * {@link AuthConstants#AUTHORIZATION_REQUEST_ATTRIBUTE}
 */
@Slf4j
public class HeaderAuthenticationFilter implements Filter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    private JwtTokenValidator jwtTokenValidator;

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
        log.trace("Check authentication header for " + request.getPathInfo());

        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

        if(authorizationHeader == null) {
            log.trace("No Authorization header provided");
            return null;
        }

        if(!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.info("Authorization header does not contain a Bearer token");
            return null;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token);

        if(claims != null) {
            log.trace("Valid JWT provided in Authorization header.");
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
