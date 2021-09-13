package nl.fairspace.pluto.auth.filters;

import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * This filter adds secure headers to the response in order to increase the security of the application.
 * Based on OWASP Secure Headers Project (https://owasp.org/www-project-secure-headers/).
 *
 * Relates to OWASP Top 10 2017, A6:2017-Security Misconfiguration
 * (https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration)
 *
 * Headers already included by default: "Strict-Transport-Security"
 */
@Component
public class SecureResponseHeaderAppenderFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        httpServletResponse.setHeader("X-Frame-Options", "DENY");
        httpServletResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpServletResponse.setHeader("X-XSS-Protection", "0");
        httpServletResponse.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        httpServletResponse.setHeader(
                "Content-Security-Policy",
                "default-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' 'unsafe-inline' https://*"
        );
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }
}
