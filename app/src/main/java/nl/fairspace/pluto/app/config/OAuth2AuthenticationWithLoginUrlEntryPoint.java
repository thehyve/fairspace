package nl.fairspace.pluto.app.config;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.provider.error.OAuth2AuthenticationEntryPoint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class OAuth2AuthenticationWithLoginUrlEntryPoint extends OAuth2AuthenticationEntryPoint {
    public static final String LOGIN_PATH_HEADER = "X-Login-Path";
    private String loginPath;

    public OAuth2AuthenticationWithLoginUrlEntryPoint(String loginPath) {
        this.loginPath = loginPath;
    }

    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        super.commence(request, response, authException);
        response.addHeader(LOGIN_PATH_HEADER, loginPath);
    }

}
