package io.fairspace.saturn.services.health;

import java.util.Collections;
import javax.sql.DataSource;

public class HealthService {
    private final DataSource dataSource;

    public HealthService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // todo: customize the health check with the logic
    public Health getHealth() {
        Health health = new Health();
        if (dataSource != null) {
            HealthStatus dbStatus = getConnectionStatus();
            health.setStatus(dbStatus);
            health.setComponents(Collections.singletonMap("viewDatabase", dbStatus));
        }
        return health;
    }

    private HealthStatus getConnectionStatus() {
        final int connectionTimeout = 1;
        try (var connection = dataSource.getConnection()) {
            if (connection.isValid(connectionTimeout)) {
                return HealthStatus.UP;
            }
            return HealthStatus.DOWN;
        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }
}
