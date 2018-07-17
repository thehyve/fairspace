package nl.fairspace.pluto.app.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.util.Assert;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class HttpStatusWithLoginUrlEntryPoint implements AuthenticationEntryPoint {
    private final HttpStatus httpStatus;
    private String loginPath;

    /**
     * Creates a new instance.
     *
     * @param httpStatus the HttpSatus to set
     */
    public HttpStatusWithLoginUrlEntryPoint(HttpStatus httpStatus, String loginPath) {
        this.loginPath = loginPath;
        Assert.notNull(httpStatus, "httpStatus cannot be null");
        this.httpStatus = httpStatus;
    }

    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(httpStatus.value());
        response.addHeader("X-Login-Page", loginPath);
    }

}
