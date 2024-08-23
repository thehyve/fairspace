package io.fairspace.saturn.webdav;

import io.fairspace.saturn.config.Services;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import java.util.Arrays;

@Configuration
public class WebDAVConfig {

    @Bean
    public ServletRegistrationBean<WebDAVServlet> webDavServlet(Services svcs) {
        ServletRegistrationBean<WebDAVServlet> bean =
                new ServletRegistrationBean<>(svcs.getDavServlet(), "/api/webdav/*");
        bean.setLoadOnStartup(1);
        return bean;
    }

    /**
     * Configure the firewall to allow WebDAV methods.
     * By default, Spring Security blocks all methods except GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, and TRACE.
     *
     * @return the firewall
     */
    @Bean
    public StrictHttpFirewall webDavFilterFirewall() {
        final StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowedHttpMethods(Arrays.stream(ExtendedHttpMethod.values()).map(Enum::name).toList());
        return firewall;
    }

    private enum ExtendedHttpMethod {
        GET,
        HEAD,
        POST,
        PUT,
        PATCH,
        DELETE,
        OPTIONS,
        TRACE,
        COPY,
        LOCK,
        MKCOL,
        MOVE,
        PROPFIND,
        PROPPATCH,
        UNLOCK
    }
}
