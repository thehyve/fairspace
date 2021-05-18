package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;

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

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;

@Slf4j
public class SessionAuthenticationFilter implements Filter {
    private JwtTokenValidator jwtTokenValidator;
    private OAuthFlow oAuthFlow;

    public SessionAuthenticationFilter(JwtTokenValidator jwtTokenValidator, OAuthFlow oAuthFlow) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.oAuthFlow = oAuthFlow;
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

        OAuthAuthenticationToken authenticationToken = retrieveSessionAuthentication((HttpServletRequest) request, (HttpServletResponse) response);
        if(authenticationToken != null) {
            request.setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
        }

        chain.doFilter(request, response);
    }

    private OAuthAuthenticationToken retrieveSessionAuthentication(HttpServletRequest request, HttpServletResponse response) {
        log.trace("Handle authentication for " + request.getRequestURI());

        // Get token from session
        OAuthAuthenticationToken token = getTokenFromSession(request);

        // Nothing in session
        if(token == null) {
            log.trace("No JWT has been found in the user session");
            return null;
        }

        log.trace("Retrieved authentication token from session: {}", token);

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token.getAccessToken());

        // If it validates, return
        if(claims != null) {
            log.trace("Valid JWT found in the user session");
            return token.toBuilder().claimsSet(claims).build();
        }

        // If it does not validate, but we have a valid refresh token, perform a refresh
        log.trace("JWT in user session is not valid anymore.");
        if(token.getRefreshToken() != null) {
            try {
                log.debug("Access token has expired and a valid refresh token was found in the user session. Try refreshing the access token");

                // Refresh the token
                OAuthAuthenticationToken refreshedToken = oAuthFlow.refreshToken(token);

                log.trace("Refreshed authentication token: {}", refreshedToken);

                if(refreshedToken != null) {
                    // Parse the refreshed token and return the data
                    Map<String, Object> refreshedTokenClaims = jwtTokenValidator.parseAndValidate(refreshedToken.getAccessToken());

                    if(refreshedTokenClaims != null) {
                        log.trace("The access token has been refreshed. Storing the new access token in session.");
                        OAuthAuthenticationToken tokenWithClaims = refreshedToken.toBuilder().claimsSet(refreshedTokenClaims).build();
                        storeTokenInSession(tokenWithClaims, request);
                        return tokenWithClaims;
                    } else {
                        log.warn("The access token has been refreshed, but the returned token seems to be invalid.");
                        return null;
                    }
                }

                // If for some reasons the validation failed, the authentication is invalid
                log.trace("Refreshing the access token has failed.");
                return null;
            } catch(Exception e) {
                log.error("An error occurred while refreshing oAuth token", e);
                return null;
            }
        }

        // In this case, both the accesstoken and the refresh token have expired
        log.info("A token was found in session, but both the access_token has expired and no refresh token was available");
        return null;
    }

    private OAuthAuthenticationToken getTokenFromSession(HttpServletRequest request) {
        log.trace("Retrieving oAuth token from session with id {}", request.getSession().getId());
        Object authenticationToken = request.getSession().getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);

        if(authenticationToken instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) authenticationToken;
        } else {
            return null;
        }
    }

    private void storeTokenInSession(OAuthAuthenticationToken token, HttpServletRequest request) {
        request.getSession().setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, token);
    }

    @Override
    public void destroy() {

    }
}
