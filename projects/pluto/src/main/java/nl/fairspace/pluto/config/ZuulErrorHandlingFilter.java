package nl.fairspace.pluto.config;

import com.netflix.zuul.*;
import com.netflix.zuul.context.*;
import com.netflix.zuul.exception.*;
import org.springframework.stereotype.*;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.ERROR_TYPE;

@Component
public class ZuulErrorHandlingFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return ERROR_TYPE;
    }

    @Override
    public int filterOrder() {
        return -1;
    }

    @Override
    public boolean shouldFilter() {
        return RequestContext.getCurrentContext().getThrowable() != null;
    }

    @Override
    public Object run() {
        var context = RequestContext.getCurrentContext();
        var throwable = context.getThrowable();
        if (throwable instanceof ZuulException) {
            context.remove("throwable");
            var zuulException = (ZuulException) throwable;
            context.setResponseStatusCode(zuulException.nStatusCode);
        }
        return null;
    }
}
