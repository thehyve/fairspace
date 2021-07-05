package io.fairspace.saturn.services.health;

import io.fairspace.saturn.services.views.ViewStoreClient;

import java.util.Collections;

public class HealthService {
    private final ViewStoreClient viewStoreClient;

    public HealthService(ViewStoreClient viewStoreClient) {
        this.viewStoreClient = viewStoreClient;
    }

    public Health getHealth() {
        Health health = new Health();
        if (viewStoreClient != null) {
            HealthStatus dbStatus = getConnectionStatus();
            health.setStatus(dbStatus);
            health.setComponents(Collections.singletonMap("viewDatabase", dbStatus));
        }
        return health;
    }

    private HealthStatus getConnectionStatus() {
        final int connectionTimeout = 1;
        try {
            if (viewStoreClient.connection.isValid(connectionTimeout)) {
                return HealthStatus.UP;
            }
            return HealthStatus.DOWN;
        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }

}
