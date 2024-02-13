package io.fairspace.saturn;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.testcontainers.containers.PostgreSQLContainer;

public class PostgresAwareTest {

    protected static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            "postgres:15-alpine"
    );

    @BeforeClass
    public static void beforeAll() {
        postgres.start();
    }

    @AfterClass
    public static void afterAll() {
        postgres.stop();
    }

}
