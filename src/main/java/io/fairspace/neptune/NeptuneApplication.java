package io.fairspace.neptune;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;

@SpringBootApplication
@EnableResourceServer
@EnableZuulProxy
public class NeptuneApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeptuneApplication.class, args);
	}
}
