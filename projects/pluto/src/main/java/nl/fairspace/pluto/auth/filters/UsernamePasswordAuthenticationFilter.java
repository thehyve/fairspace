package nl.fairspace.pluto.auth.filters;

import com.nimbusds.oauth2.sdk.ParseException;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.OAuthFlow;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;

@Slf4j
public class UsernamePasswordAuthenticationFilter implements Filter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BASIC_PREFIX = "Basic ";
    private final OAuthFlow oAuthFlow;

    public UsernamePasswordAuthenticationFilter(OAuthFlow oAuthFlow) {
        this.oAuthFlow = oAuthFlow;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // If the authorization is already set, skip this filter
        if (request.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
            chain.doFilter(request, response);
            return;
        }

        // Otherwise, check if the authorization can be found in the header
        OAuthAuthenticationToken authenticationToken;
        try {
            authenticationToken = retrieveHeaderAuthorization((HttpServletRequest) request);
        } catch (ParseException | URISyntaxException e) {
            log.error("Error retrieving authentication token", e);
            throw new IOException(e);
        }

        log.trace("Retrieved authentication token from request: {}", authenticationToken);

        if (authenticationToken != null) {
            request.setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
        }

        chain.doFilter(request, response);
    }

    private OAuthAuthenticationToken retrieveHeaderAuthorization(HttpServletRequest request) throws ParseException, IOException, URISyntaxException {
        log.debug("Check authentication header for " + request.getPathInfo());

        var authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

        if (authorizationHeader == null) {
            log.debug("No Authorization header provided");
            return null;
        }

        if (!authorizationHeader.startsWith(BASIC_PREFIX)) {
            log.debug("Authorization header does not contain a Basic token");
            return null;
        }

        var auth = authorizationHeader.substring(BASIC_PREFIX.length());

        var token = fetchToken(auth);
        request.getSession().setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        return token;
    }

    private OAuthAuthenticationToken fetchToken(String auth) throws ParseException, IOException, URISyntaxException {
        var decoded = new String(Base64.getDecoder().decode(auth), StandardCharsets.UTF_8);
        var usernamePassword = decoded.split(":");
        if (usernamePassword.length != 2) {
            log.debug("Malformed Basic authorization header");
            return null;
        }
        return oAuthFlow.retrieveTokenBasicAuth(usernamePassword[0], usernamePassword[1]);
    }

    @Override
    public void destroy() {
    }
}
