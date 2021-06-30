package nl.fairspace.pluto.web;

import com.fasterxml.jackson.databind.JsonNode;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("downstreamServiceCheck")
public class DownstreamServiceHealthIndicator implements HealthIndicator {

    @Autowired
    PlutoConfig plutoConfig;

    RestTemplate restTemplate = new RestTemplate();

    @Override
    public Health health() {
        if (plutoConfig.getDownstreamServiceHealthUrl() == null) {
            return Health.up().build();
        }
        try {
            ResponseEntity<JsonNode> responseEntity
                    = restTemplate.getForEntity(plutoConfig.getDownstreamServiceHealthUrl(), JsonNode.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                String status = responseEntity.getBody().get("status").textValue();
                if (status.equals("OK")) {
                    return Health.up().withDetail("status", "OK").build();
                } else {
                    return Health.down().build();
                }
            } else {
                return Health.down().build();
            }
        } catch (Exception e) {
            return Health.down().withException(e).build();
        }
    }
}
