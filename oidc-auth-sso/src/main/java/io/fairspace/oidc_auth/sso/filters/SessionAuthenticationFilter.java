package io.fairspace.oidc_auth.sso.filters;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.oidc_auth.sso.OAuthFlow;
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
import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
@Component
public class SessionAuthenticationFilter implements Filter {
    private JwtTokenValidator jwtTokenValidator;
    private OAuthFlow oAuthFlow;

    @Autowired
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
        log.debug("Handle authentication for " + request.getPathInfo());

        // Get token from session
        OAuthAuthenticationToken token = getTokenFromSession(request);

        // Nothing in session
        if(token == null) {
            log.debug("No JWT has been found in the user session");
            return null;
        }

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token.getAccessToken());

        // If it validates, return
        if(claims != null) {
            log.debug("Valid JWT found in the user session");
            return token.toBuilder().claimsSet(claims).build();
        }

        // If it does not validate, but we have a valid refresh token, perform a refresh
        log.debug("JWT in user session is not valid anymore.");
        Map<String, Object> refreshTokenClaims = jwtTokenValidator.parseAndValidate(token.getRefreshToken());
        if(refreshTokenClaims != null) {
            try {
                log.debug("A valid refresh token was found in the user session. Try refreshing the access token");

                // Refresh the token
                OAuthAuthenticationToken refreshedToken = oAuthFlow.refreshToken(token);

                if(refreshedToken != null) {
                    // Parse the refreshed token and return the data
                    Map<String, Object> refreshedTokenClaims = jwtTokenValidator.parseAndValidate(refreshedToken.getAccessToken());

                    if(refreshedTokenClaims != null) {
                        log.debug("The access token has been refreshed. Storing the new access token in session.");
                        OAuthAuthenticationToken tokenWithClaims = refreshedToken.toBuilder().claimsSet(refreshedTokenClaims).build();
                        storeTokenInSession(tokenWithClaims, request);
                        return tokenWithClaims;
                    }
                }

                // If for some reasons the validation failed, the authentication is invalid
                log.debug("Refreshing the access token has failed.");
                return null;
            } catch(Exception e) {
                log.error("An error occurred while refreshing oAuth token", e);
                return null;
            }
        }

        // In this case, both the accesstoken and the refreshtoken have expired
        log.debug("A token was found in session, but both the access_token and refresh_token have expired");
        return null;
    }

    private OAuthAuthenticationToken getTokenFromSession(HttpServletRequest request) {
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
