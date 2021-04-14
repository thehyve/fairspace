package nl.fairspace.pluto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;

@SpringBootApplication
@EnableZuulProxy
public class PlutoApplication {
	public static void main(String[] args) {
		SpringApplication.run(PlutoApplication.class, args);
	}
}
