package nl.fairspace.pluto.app.auth.filters;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.JwtTokenValidator;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
import nl.fairspace.pluto.app.auth.OAuthTokenRefresher;
import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_ATTRIBUTE;

@Slf4j
public class SessionAuthenticationFilter implements Filter {
    private static final String PLUTO_AUTH_SESSION_ATTRIBUTE_NAME = "PlutoAuthentication";

    private JwtTokenValidator jwtTokenValidator;
    private OAuthTokenRefresher tokenRefresher;

    @Autowired
    public SessionAuthenticationFilter(JwtTokenValidator jwtTokenValidator, OAuthTokenRefresher tokenRefresher) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.tokenRefresher = tokenRefresher;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        OAuthAuthenticationToken authenticationToken = retrieveSessionAuthentication((HttpServletRequest) request, (HttpServletResponse) response);
        if(authenticationToken != null) {
            request.setAttribute(AUTHORIZATION_ATTRIBUTE, authenticationToken);
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
        JWTClaimsSet jwtClaimsSet = jwtTokenValidator.parseAndValidate(token.getAccessToken());

        // If it validates, return
        if(jwtClaimsSet != null) {
            return token;
        }

        // If it does not validate, but we have a valid refresh token, perform a refresh
        log.debug("JWT in user session is not valid anymore.");
        JWTClaimsSet refreshTokenClaimsSet = jwtTokenValidator.parseAndValidate(token.getRefreshToken());
        if(refreshTokenClaimsSet != null) {
            try {
                log.debug("A valid refresh token was found in the user session. Try refreshing the access token");

                // Refresh the token
                OAuthAuthenticationToken refreshedToken = tokenRefresher.refreshToken(token);

                // Parse the refreshed token and return the data
                JWTClaimsSet refreshedTokenClaimsSet = jwtTokenValidator.parseAndValidate(refreshedToken.getAccessToken());

                if(refreshedTokenClaimsSet != null) {
                    log.debug("The access token has been refreshed. Storing the new access token in session.");
                    storeTokenInSession(refreshedToken, request);
                    return refreshedToken.toBuilder().claimsSet(refreshedTokenClaimsSet).build();
                } else {
                    // If for some reasons the validation failed, the authentication is invalid
                    log.debug("Refreshing the access token has failed.");
                    return null;
                }
            } catch(Exception e) {
                log.error("An error occurred while refreshing oAuth token", e);
                return null;
            }
        }

        return token;
    }

    private OAuthAuthenticationToken getTokenFromSession(HttpServletRequest request) {
        Object authenticationToken = request.getSession().getAttribute(PLUTO_AUTH_SESSION_ATTRIBUTE_NAME);

        if(authenticationToken != null && authenticationToken instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) authenticationToken;
        } else {
            return null;
        }
    }

    private void storeTokenInSession(OAuthAuthenticationToken token, HttpServletRequest request) {
        request.getSession().setAttribute(PLUTO_AUTH_SESSION_ATTRIBUTE_NAME, token);
    }

    @Override
    public void destroy() {

    }
}
