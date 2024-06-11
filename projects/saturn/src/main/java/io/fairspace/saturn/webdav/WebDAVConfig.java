package io.fairspace.saturn.webdav;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.fairspace.saturn.config.Services;

@Configuration
public class WebDAVConfig {

    @Bean
    public ServletRegistrationBean<WebDAVServlet> webDavServlet(Services svcs) {
        ServletRegistrationBean<WebDAVServlet> bean =
                new ServletRegistrationBean<>(svcs.getDavServlet(), "/api/webdav/*");
        bean.setLoadOnStartup(1);
        return bean;
    }
}
