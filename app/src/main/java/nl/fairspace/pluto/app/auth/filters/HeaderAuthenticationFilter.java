package nl.fairspace.pluto.app.auth.filters;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.JwtTokenValidator;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
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

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
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
        JWTClaimsSet jwtClaimsSet = jwtTokenValidator.parseAndValidate(token);

        if(jwtClaimsSet != null) {
            log.debug("Valid JWT provided in Authorization header.");
            return new OAuthAuthenticationToken(token, jwtClaimsSet);
        } else {
            log.debug("JWT provided in Authorization header is not valid. It may have expired.");
            return null;
        }
    }

    @Override
    public void destroy() {

    }
}
