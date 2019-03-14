package io.fairspace.saturn;

import java.time.Instant;

import static java.time.Instant.now;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class TestUtils {
    public static void ensureRecentInstant(Instant instant) {
        assertNotNull(instant);
        assertTrue(instant.isAfter(now().minusSeconds(1)));
        assertTrue(now().equals(instant) || instant.isBefore(now()));
    }
}
