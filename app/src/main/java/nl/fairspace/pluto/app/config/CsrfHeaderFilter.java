package nl.fairspace.pluto.app.config;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class CsrfHeaderFilter extends OncePerRequestFilter {

    public static final String CSRF_ATTRIBUTE_NAME = "_csrf";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(request.getAttribute(CSRF_ATTRIBUTE_NAME) != null) {
            CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
            response.addHeader(token.getHeaderName(), token.getToken());
        }

        filterChain.doFilter(request, response);
    }
}
