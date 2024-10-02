package io.fairspace.saturn;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.testcontainers.containers.PostgreSQLContainer;

import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.config.properties.ViewDatabaseProperties;

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

    protected SearchProperties buildSearchProperties() {
        SearchProperties searchProperties = new SearchProperties();
        searchProperties.setCountRequestTimeout(60000);
        searchProperties.setPageRequestTimeout(10000);
        searchProperties.setMaxJoinItems(50);
        return searchProperties;
    }
}
