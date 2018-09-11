package nl.fairspace.pluto.app.auth.zuul;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
@Component
@Profile("!noAuth")
public class TokenForwarderZuulFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 0;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        // Retrieve token from the request
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        OAuthAuthenticationToken token = (OAuthAuthenticationToken) request.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);

        // If no token was provided, some error occurred in the authorization filters
        // The request should not get here
        if(token == null) {
            throw new ZuulException("No valid oAuth token provided in the request", 401, "No valid token was found on the request. No token could be forwarded upstream");
        }

        // Add the token upstream
        log.debug("Added oAuth token to upstream request");
        ctx.addZuulRequestHeader("Authorization", "Bearer " + token.getAccessToken());

        return null;
    }
}
