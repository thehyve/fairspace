package io.fairspace.saturn;

import io.fairspace.saturn.config.properties.ViewDatabaseProperties;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.testcontainers.containers.PostgreSQLContainer;

public class PostgresAwareTest {

    protected static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @BeforeClass
    public static void beforeAll() {
        postgres.start();
    }

    @AfterClass
    public static void afterAll() {
        postgres.stop();
    }

    protected ViewDatabaseProperties buildViewDatabaseConfig() {
        var viewDatabase = new ViewDatabaseProperties();
        viewDatabase.setUrl(postgres.getJdbcUrl());
        viewDatabase.setUsername(postgres.getUsername());
        viewDatabase.setPassword(postgres.getPassword());
        viewDatabase.setMaxPoolSize(5);
        return viewDatabase;
    }
}
