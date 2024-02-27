package nl.fairspace.pluto.web;

import java.util.Objects;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import nl.fairspace.pluto.config.dto.PlutoConfig;
import nl.fairspace.pluto.web.dto.DownstreamServiceHealthStatus;

@Component("downstreamServiceCheck")
public class DownstreamServiceHealthIndicator implements HealthIndicator {

    final PlutoConfig plutoConfig;

    RestTemplate restTemplate = new RestTemplate();

    public DownstreamServiceHealthIndicator(PlutoConfig plutoConfig) {
        this.plutoConfig = plutoConfig;
    }

    @Override
    public Health health() {
        if (plutoConfig.getDownstreamServiceHealthUrl() == null) {
            return Health.up().build();
        }
        try {
            ResponseEntity<DownstreamServiceHealthStatus> responseEntity = restTemplate.getForEntity(
                    plutoConfig.getDownstreamServiceHealthUrl(), DownstreamServiceHealthStatus.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                DownstreamServiceHealthStatus responseBody = Objects.requireNonNull(responseEntity.getBody());
                Health.Builder builder = responseBody.getStatus().equals("UP") ? Health.up() : Health.down();
                if (!responseBody.getComponents().isEmpty()) {
                    responseBody.getComponents().forEach(builder::withDetail);
                }
                return builder.build();
            }
            return Health.down().build();
        } catch (Exception e) {
            return Health.down().withException(e).build();
        }
    }
}
