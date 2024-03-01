package io.fairspace.saturn.services.health;

import java.io.IOException;
import java.sql.SQLException;

import com.zaxxer.hikari.HikariDataSource;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import lombok.SneakyThrows;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.PostgresAwareTest;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.TestUtils.loadViewsConfig;

@RunWith(MockitoJUnitRunner.class)
public class HealthServiceTest extends PostgresAwareTest {
    HealthService healthService;
    ViewStoreClientFactory viewStoreClientFactory;

    @Before
    public void before()
            throws SQLException, NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var viewDatabase = new Config.ViewDatabase();
        viewDatabase.url = postgres.getJdbcUrl();
        viewDatabase.username = postgres.getUsername();
        viewDatabase.password = postgres.getPassword();
        viewDatabase.maxPoolSize = 5;
        ViewsConfig config = loadViewsConfig("src/test/resources/test-views.yaml");
        viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase, new Config.Search());

        healthService = new HealthService(viewStoreClientFactory.dataSource);
    }

    @Test
    public void testRetrieveStatus_UP() {
        healthService = new HealthService(null);
        var health = healthService.getHealth();

        Assert.assertEquals(health.getStatus(), HealthStatus.UP);
        Assert.assertTrue(health.getComponents().isEmpty());
    }

    @Test
    public void testRetrieveStatusWithViewDatabase_UP() {
        var health = healthService.getHealth();

        Assert.assertEquals(health.getStatus(), HealthStatus.UP);
        Assert.assertEquals(health.getComponents().size(), 1);
        Assert.assertEquals(health.getComponents().get("viewDatabase"), HealthStatus.UP);
    }

    @SneakyThrows
    @Test
    public void testRetrieveStatusWithViewDatabase_DOWN() {
        ((HikariDataSource) viewStoreClientFactory.dataSource).close();
        var health = healthService.getHealth();

        Assert.assertEquals(health.getStatus(), HealthStatus.DOWN);
        Assert.assertEquals(health.getComponents().size(), 1);
        Assert.assertEquals(health.getComponents().get("viewDatabase"), HealthStatus.DOWN);
    }
}
