package io.fairspace.saturn.webdav;

import java.util.Arrays;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import io.fairspace.saturn.config.Services;
import io.fairspace.saturn.config.condition.ConditionalOnMultiValuedProperty;

@Configuration
public class WebDAVConfig {

    @Bean
    public ServletRegistrationBean<WebDAVServlet> webDavServlet(WebDAVServlet webDavServlet) {
        return new ServletRegistrationBean<>(webDavServlet, "/api/webdav/*");
    }

    @Bean
    @ConditionalOnMultiValuedProperty(prefix = "application", name = "features", havingValue = "ExtraStorage")
    public ServletRegistrationBean<WebDAVServlet> webDavExtraStorageServlet(Services svcs) {
        return new ServletRegistrationBean<>(svcs.getExtraDavServlet(), "/api/extra-storage/*");
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
        firewall.setAllowedHttpMethods(
                Arrays.stream(ExtendedHttpMethod.values()).map(Enum::name).toList());
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
