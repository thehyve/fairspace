package nl.fairspace.pluto.auth.filters;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
@Component
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

        // If no token was provided, the request is probably not authenticated.
        // In that case, we can not send along any request header
        if (token == null) {
            log.trace("No valid token was found on the request. No token could be forwarded upstream");
        } else {
            // Add the token upstream
            log.trace("Added oAuth token to upstream request");
            ctx.addZuulRequestHeader("Authorization", "Bearer " + token.getAccessToken());
        }
        return null;
    }
}
