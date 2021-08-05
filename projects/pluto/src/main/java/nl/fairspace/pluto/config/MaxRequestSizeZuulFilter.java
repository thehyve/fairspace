package nl.fairspace.pluto.config;

import com.netflix.zuul.*;
import com.netflix.zuul.context.*;
import com.netflix.zuul.exception.*;
import lombok.extern.slf4j.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.autoconfigure.web.servlet.*;
import org.springframework.http.*;
import org.springframework.stereotype.*;
import org.springframework.util.unit.*;

import javax.servlet.http.*;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;

@Slf4j
@Component
public class MaxRequestSizeZuulFilter extends ZuulFilter {
    @Autowired
    MultipartProperties multipartProperties;

    @Override
    public String filterType() {
        return PRE_TYPE;
    }

    @Override
    public int filterOrder() {
        return 1;
    }

    @Override
    public boolean shouldFilter() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        return HttpMethod.POST.matches(request.getMethod());
    }

    @Override
    public Object run() throws ZuulException {
        DataSize maxRequestSize = null;
        if (multipartProperties != null) {
            maxRequestSize = multipartProperties.getMaxRequestSize();
        }
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        long contentLength = request.getContentLengthLong();
        if (maxRequestSize != null) {
            if (maxRequestSize.toBytes() < contentLength) {
                log.error("Request body exceeds size limit of {}: {}", maxRequestSize, contentLength);
                throw new ZuulException(
                        "Payload too large",
                        HttpStatus.PAYLOAD_TOO_LARGE.value(),
                        "Request body exceeds size limit of %s".formatted(maxRequestSize));
            }
        }
        return null;
    }
}
